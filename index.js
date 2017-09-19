var BasePlugin = require('ember-cli-deploy-plugin');
var Rsync = require('rsync');

module.exports = {
  name: 'ember-cli-deploy-scp',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        port: '22',
        directory: 'tmp/deploy-dist/.',
        exclude: false,
        flags: 'rtvu',
        displayCommands: false,
        options: {},
        beforeBuild: function() {},
        beforeUpload: function() {}
      },

      requiredConfig: ['username', 'path', 'host'],

      willBuild: function(context) {
        this.readConfig('beforeBuild');
      },

      willUpload: function(context) {
        this.readConfig('beforeUpload');
      },

      build: function(context) {
      },

      rsync: function (destination) {
        var _this = this;
        var rsync = new Rsync()
          .shell('ssh -p ' + this.readConfig('port'))
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
        var generatedPath = this.readConfig('username') + '@' + this.readConfig('host') + ':' + this.readConfig('path'),
            parentPath = generatedPath.substr(0, generatedPath.lastIndexOf("/"));

        return this.rsync(parentPath + '/' + this.revisionKey(context)).then(() => {
          return this.rsync(generatedPath);
        });
      }
    });

    return new DeployPlugin();
  }
};
