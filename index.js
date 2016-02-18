var BasePlugin = require('ember-cli-deploy-plugin');
var scp = require('scp');

module.exports = {
  name: 'ember-cli-deploy-scp',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        filePattern: '**/*.{js,css,png,jpg}', // default filePattern if it isn't defined in config/dpeloy.js
        port: '22',
        directory: 'tmp/deploy-dist/*'
      },

      requiredConfig: ['username', 'path', 'host'],

      build: function(context) {
        this.log('Building...');
      },

      upload: function(context) {
        this.log('Uploading...');

        var options = {
          file: this.readConfig('directory'),
          user: this.readConfig('username'),
          host: this.readConfig('host'),
          port: this.readConfig('port'),
          path: this.readConfig('path')
        }

        var self = this;

        scp.send(options, function (err) {
          if (err) {
            self.log(err);
          } else {
            self.log('File transferred.');
          }
        });

        this.log('Done !');
      }
    });

    return new DeployPlugin();
  }
};