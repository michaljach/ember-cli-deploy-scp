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
        beforeBuild: function(){},
        beforeUpload: function(){}
      },

      requiredConfig: ['username', 'path', 'host'],

      willBuild: function(context) {
        this.readConfig('beforeBuild');
      },
      willUpload: function(context) {
        this.readConfig('beforeUpload');
      },
      build: function(context) {
        this.log('Building...');
      },

      fetchRevisions: function(keyPrefix) {
        var self = this;
        return Promise.resolve(function(){
          return [
              {
                revision: 'abc123', // mandatory
                version: 'v1',
                timestamp: 1438232435000, // milliseconds since epoch
                deployer: 'cats'
              },
              {
                revision: 'def456',
                version: 'v2',
                timestamp: 1032123128000,
                deployer: 'dogs',
                active: true // indicate whether this revision is activated
              }
            ]
        }())
        .then(function(revisions){
          return { revisions: revisions };
        })
        .catch(function(err) {
          self.log(err);
        });
      },

      rsync: function (destination){
        var _this = this;
        var rsync = new Rsync()
          .shell('ssh -p '+this.readConfig('port'))
          .flags(this.readConfig('flags))
          .source(this.readConfig('directory'))
          .destination(destination);

        if (this.readConfig('exclude')){
          rsync.set('exclude', this.readConfig('exclude'));
        }

        if (this.readConfig('displayCommands')){
          this.log(rsync.command())
        }

        rsync.execute(function(error, code, cmd) {
            _this.log('Done !');
        });
      },

      upload: function(context) {
        this.log('Uploading...');
        var MyDate = new Date(),
            MyDateString,
            generatedPath = this.readConfig('username') + '@' + this.readConfig('host') + ':' + this.readConfig('path'),
            parentPath = generatedPath.substr(0, generatedPath.lastIndexOf("/"));

        MyDate.setDate(MyDate.getDate());
        MyDateString = ('0' + MyDate.getDate()).slice(-2) + ('0' + (MyDate.getMonth()+1)).slice(-2) + MyDate.getFullYear() + ('0' + MyDate.getHours()).slice(-2) + ('0' + MyDate.getMinutes()).slice(-2);
        this.rsync(parentPath + '/' + MyDateString);
        this.rsync(generatedPath);
        this.log('Done !');
      }
    });

    return new DeployPlugin();
  }
};
