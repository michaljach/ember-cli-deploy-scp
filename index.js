/* eslint-env node */

"use strict";

let BasePlugin = require('ember-cli-deploy-plugin');
let Rsync = require('rsync');

const DEFAULT_PORT = 22;

// takes an array of functions, each returning a promise when invoked
let sequentially = function(iterable) {
  return iterable.reduce((sum, func) => {
    return sum.then(() => func());
  }, Promise.resolve());
};

// An ISO8601 string without separators (not allowed in directory names),
// so something like 20160327T0701, which is equivalent to 2016-03-27T07:01
let iso8601DirectoryName = function() {
  return (new Date()).toISOString().replace(/[-:\.]/g, '').slice(0, 13);
};

module.exports = {
  name: 'ember-cli-deploy-scp',

  createDeployPlugin(options) {
    let DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        port: DEFAULT_PORT, // TODO remove when `nodes` is the only supported config
        directory: 'tmp/deploy-dist/.',
        exclude: false,
        flags: 'rtvu',
        displayCommands: false,
        options: {},
        beforeBuild: () => {},
        beforeUpload: () => {},
      },

      // NOTE when `nodes` is the only supported
      // syntax we can uncomment this setting
      // requiredConfig: ['nodes'],

      willBuild(context) {
        this.readConfig('beforeBuild');
      },

      willUpload(context) {
        this.readConfig('beforeUpload');
      },

      build(context) {},

      rsync(destination, port) {
        let rsync = new Rsync()
          .shell('ssh -p ' + port)
          .flags(this.readConfig('flags'))
          .source(this.readConfig('directory'))
          .destination(destination);

        let opts = this.readConfig('options');
        Object.keys(opts).forEach((key) => {
          rsync.set(key, opts[key]);
        });

        if (this.readConfig('exclude')) {
          rsync.exclude(this.readConfig('exclude'));
        }

        // TOOD remove in a future release
        if (this.readConfig('displayCommands')) {
          this.log('DEPRECATED: use the --verbose flag instead of `displayCommands` to print rsync commands', {
            color: 'yellow',
          });

          this.log(rsync.command());
        }

        // log rsync command in verbose mode
        this.log(rsync.command(), { verbose: true });

        return new Promise((resolve, reject) => {
          rsync.execute((error, code, cmd) => {
            if (error) {
              this.log(error);
              reject(error);
            } else {
              this.log('Done!');
              resolve();
            }
          });
        });
      },

      revisionKey(context) {
        if (context.revisionData && context.revisionData.revisionKey) {
          return context.revisionData.revisionKey;
        }

        return iso8601DirectoryName();
      },

      upload(context) {
        let revisionKey = this.revisionKey(context);
        let nodes = this.readConfig('nodes');

        if (this.readConfig('username')) {
          this.log('This syntax has been deprecated in favour of the `nodes` option, see repo README for details', {
            color: 'yellow',
          });

          let username    = this.readConfig('username');
          let host        = this.readConfig('host');
          let path        = this.readConfig('path');
          let port        = this.readConfig('port');

          return this._upload(username, host, port, path, revisionKey);
        } else if (nodes) {
          return sequentially(nodes.map((n) => {
            let username    = n.username;
            let host        = n.host;
            let path        = n.path;
            let port        = n.port || DEFAULT_PORT;

            if (!username) {
              _missingNodeConfig('username');
            }

            if (!host) {
              _missingNodeConfig('host');
            }

            if (!path) {
              _missingNodeConfig('path');
            }

            // function wrapper needed by the `sequentially` helper, otherwise they would
            // still execute in parallel
            return () => { return this._upload(username, host, port, path, revisionKey); }
          }));
        }
      },

      _missingNodeConfig(key) {
        let message = `Objects in the nodes array must have '${key}' (see readme)`;
        this.log(message, { color: 'red' });
        throw new Error(message);
      },

      _upload(username, host, port, path, revisionKey) {
        let targetPath = `${username}@${host}:${path}`;
        return this._uploadFiles(targetPath, revisionKey, port);
      },

      _uploadFiles(targetPath, revisionKey, port) {
        this.log(`Beginning upload to ${targetPath}`, { verbose: true });
        let parentPath = targetPath.substr(0, targetPath.lastIndexOf('/'));

        return this.rsync(parentPath + '/' + revisionKey, port).then(() => {
          return this.rsync(targetPath, port);
        }).then((res) => {
          this.log('Upload completed', { verbose: true });
          return res;
        });
      },
    });

    return new DeployPlugin();
  }
};
