# ember-cli-deploy-scp

Easy deploy your Ember applications via ssh using scp.

### Installation
Install ember-cli-deploy plugin first:
```javascript
ember install ember-cli-deploy
```
Then install ember-cli-deploy-scp plugin
```javascript
ember install ember-cli-deploy-scp
```
### Usage
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
