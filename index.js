var BasePlugin = require('ember-cli-deploy-plugin');
var Rsync = require('rsync');

var DEFAULT_PORT = 22;

// takes an array of functions, each returning a promise when invoked
var sequentially = function(iterable) {
  return iterable.reduce((sum, func) => {
    return sum.then(() => func());
  }, Promise.resolve());
};

module.exports = {
  name: 'ember-cli-deploy-scp',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        port: DEFAULT_PORT,
        directory: 'tmp/deploy-dist/.',
        exclude: false,
        flags: 'rtvu',
        displayCommands: false,
        options: {},
        beforeBuild: function() {},
        beforeUpload: function() {},
      },

      willBuild: function(context) {
        this.readConfig('beforeBuild');
      },

      willUpload: function(context) {
        this.readConfig('beforeUpload');
      },

      build: function(context) {
      },

      rsync: function (destination, port) {
        var _this = this;
        var rsync = new Rsync()
          .shell('ssh -p ' + port)
          .flags(this.readConfig('flags'))
          .source(this.readConfig('directory'))
          .destination(destination);

        Object.keys(this.readConfig('options')).forEach(function(key) {
          rsync.set(key, _this.readConfig('options')[key]);
        });

        if (this.readConfig('exclude')){
          rsync.exclude(this.readConfig('exclude'));
        }

        if (this.readConfig('displayCommands')) {
          this.log(rsync.command())
        } else {
          _this.log(rsync.command(), { verbose: true });
        }

        return new Promise(function(resolve, reject) {
          rsync.execute(function(error, code, cmd) {
              if (error) {
                _this.log(error);
                reject(error);
              } else {
                _this.log('Done !');
                resolve();
              }
          });
        });
      },

      revisionKey(context) {
        if (context.revisionData && context.revisionData.revisionKey) {
          return context.revisionData.revisionKey;
        }

        // An ISO8601 string without separators (not allowed in directory names),
        // so something like 20160327T0701, which is equivalent to 2016-03-27T07:01
        return (new Date()).toISOString().replace(/[-:\.]/g, '').slice(0, 13);
      },

      upload: function(context) {
        var revisionKey = this.revisionKey(context);
        var nodes = this.readConfig('nodes');

        if (this.readConfig('username')) {
          var username    = this.readConfig('username');
          var host        = this.readConfig('host');
          var path        = this.readConfig('path');
          var port        = this.readConfig('port');

          return _upload(username, host, port, path, revisionKey);
        } else if (nodes) {
          return sequentially(nodes.map((n) => {
            var username    = n.username;
            var host        = n.host;
            var path        = n.path;
            var port        = n.port || DEFAULT_PORT;

            return () => { return this._upload(username, host, port, path, revisionKey); }
          }));
        }
      },

      _upload: function(username, host, port, path, revisionKey) {
        var targetPath = username + '@' + host + ':' + path;
        return this._uploadFiles(targetPath, revisionKey, port);
      },

      _uploadFiles: function(targetPath, revisionKey, port) {
        this.log('Beginning upload to ' + targetPath, { verbose: true });
        var parentPath = targetPath.substr(0, targetPath.lastIndexOf('/'));

        return this.rsync(parentPath + '/' + revisionKey, port).then(() => {
          return this.rsync(targetPath, port);
        }).then((res) => {
          this.log('Upload completed', { verbose: true });
          return res;
        });
      },
    });

    return new DeployPlugin();
  }
};
