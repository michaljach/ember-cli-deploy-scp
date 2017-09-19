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
        }

        return new Promise(function(resolve, reject) {
          rsync.execute(function(error, code, cmd) {
              if (error) {
                reject(_this.log(error));
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

        var MyDate = new Date();
        MyDate.setDate(MyDate.getDate());

        var date = ('0' + MyDate.getDate()).slice(-2);
        var month = ('0' + (MyDate.getMonth() + 1)).slice(-2);
        var year = MyDate.getFullYear();
        var time = ('0' + MyDate.getHours()).slice(-2) + ('0' + MyDate.getMinutes()).slice(-2);

        return date + month + year + time;
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
