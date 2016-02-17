var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-scp',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        filePattern: '**/*.{js,css,png}' // default filePattern if it isn't defined in config/dpeloy.js
      },

      upload: function(context) {
        this.log('blabla...')
      }
    });

    return new DeployPlugin();
  }
};