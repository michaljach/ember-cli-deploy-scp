# ember-cli-deploy-scp [![Build Status](https://travis-ci.org/michaljach/ember-cli-deploy-scp.svg?branch=master)](https://travis-ci.org/michaljach/ember-cli-deploy-scp) [![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-s3.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

Easy deploy your Ember applications via SSH using SCP and rsync.

![ember-cli-deploy-scp](http://i.imgur.com/30TaZJu.png)

## Installation
```sh
# install dependencies (both are most likely already installed)
ember install ember-cli-deploy
ember install ember-cli-deploy-build

# install this plugin
ember install ember-cli-deploy-scp
```

## Usage
Edit `config/deploy.js`:

```javascript
module.exports = function(environment){
  let ENV = {};

  // other configuration…

  if (environment === 'production') {
    ENV['scp'] = {
      nodes: [{
        username: '<ssh-username>',
        host: '<ssh-host>',
        path: '<remote-server-path>',
      }],
    }
  };

  // …

  return ENV;
};

```

You are now ready to deploy with `ember deploy production`.


## Configuration Options

Key          | Description
---:         | ---
`nodes` | Array of nodes to connect with. For each node the required keys are `host`, `username` and `path` as well as an optional `port` (defaults to 22).
`directory` | Directory that will be uploaded (default is `tmp/deploy-dist/`).
`exclude` | Exclude specified files and directories from uploading.
`flags` | Flags to pass to the [rsync](https://www.npmjs.com/package/rsync#flagsflags-set) command (default is `rtvu`).
`options` | Options to pass to the [rsync](https://www.npmjs.com/package/rsync#setoption-value) command (empty by default). For example `{ 'rsync-path': 'mkdir -p /a/great/directory && rsync' }`


## Common Issues

### `code 12` error from `rsync`

A [`error in rsync protocol data stream (code 12)`](https://askubuntu.com/questions/625085/rsync-over-ssh-error)
that may be because the remote path is incorrect. All directories leading up to the last directory in the path
must already exist for rsync to work. This is a limitation in rsync itself, not an issue with this plugin.
