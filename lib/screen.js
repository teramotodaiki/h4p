const promiseJs = require('raw!es6-promise/dist/es6-promise.auto');
const fetchJs = require('raw!whatwg-fetch');
const requireJs = require('raw!./require.js');
const connectorJs = require('raw!./connector');


module.exports = [
  promiseJs,
  fetchJs,
  requireJs,
  connectorJs,
].join('\n');
