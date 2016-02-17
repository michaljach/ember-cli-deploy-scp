var BasePlugin = require('ember-cli-deploy-plugin');
var client = require('scp2');

module.exports = {
  name: 'ember-cli-deploy-scp',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        filePattern: '**/*.{js,css,png}' // default filePattern if it isn't defined in config/dpeloy.js
      },

      upload: function(context) {
        this.log('Uploading...');
        client.scp('dist/', 'admin:password@example.com:/home/admin/data/', function(err) {
          this.log(err);
        });
      }
    });

    return new DeployPlugin();
  }
};