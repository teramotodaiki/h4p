const promiseJs = require('raw!es6-promise/dist/es6-promise.auto');
const requireJs = require('raw!./require.js');
const connectorJs = require('raw!./connector');


module.exports = [
  promiseJs,
  requireJs,
  connectorJs,
].join('\n');
