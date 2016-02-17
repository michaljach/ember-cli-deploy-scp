var BasePlugin = require('ember-cli-deploy-plugin');
var scp = require('scp');

module.exports = {
  name: 'ember-cli-deploy-scp',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        filePattern: '**/*.{js,css,png,jpg}' // default filePattern if it isn't defined in config/dpeloy.js
      },

      requiredConfig: ['username', 'path', 'host'],

      upload: function(context) {
        this.log('Uploading...');

        var options = {
          file: 'dist/*',
          user: this.readConfig('username'),
          host: this.readConfig('host'),
          port: '22',
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