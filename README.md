# ember-cli-deploy-scp
Easy deploy your Ember applications via ssh using scp.

![ember-cli-deploy-scp][http://i.imgur.com/30TaZJu.png]

## Installation
Install ember-cli-deploy plugin first:
```javascript
ember install ember-cli-deploy
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
    Env['scp'] = {
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
Path to uploads files to
**required**
#### port 
SSH port on target server, default: 22.
**optional**