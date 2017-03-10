# ember-cli-deploy-scp ![Build Status](https://travis-ci.org/michaljach/ember-cli-deploy-scp.svg?branch=master)
Easy deploy your Ember applications via ssh using scp.

![ember-cli-deploy-scp](http://i.imgur.com/30TaZJu.png)

## Installation
Install ember-cli-deploy first:
```javascript
ember install ember-cli-deploy
```
Install ember-cli-deploy-build for automated building:
```javascript
ember install ember-cli-deploy-build
```
Then install ember-cli-deploy-scp plugin
```javascript
ember install ember-cli-deploy-scp
```
## Usage
Edit your `config/deploy.js` file:
```javascript
module.exports = function(environment){
  var ENV = {
  };

  if (environment === 'production') {
    ENV['scp'] = {
        username: '<your-username>',
        host: '<your-host>',
        path: '<your-serverpath>'
    }
  };
  return ENV;
};
```
and start deploying:
```javascript
ember deploy production
```

## Configuration Options


#### username 
Username to connect via SSH.
**required**
#### host 
Host (server address) to connect via SSH.
**required**
#### path 
Path where latest revision will be deployed to. (All older builds lands in parent directory).
**required**
#### port 
SSH port on target server, default: `22`.
**optional**
#### directory 
Directory that will be uploaded, default: `tmp/deploy-dist/`.
**optional**
#### exclude
Exclude specified files and directories from uploading.
**optional**
#### displayCommands
More complex logging.
**optional**
#### flags
Flags to pass to the [rsync](https://www.npmjs.com/package/rsync#flagsflags-set) command, default: `rtvu`.
**optional**
