const requireJs = require('raw!./require.js');
const fetchJs = require('raw!whatwg-fetch');
const promiseJs = require('raw!es6-promise');
const connectorJs = require('raw!./connector');


module.exports = [
  requireJs,
  promiseJs,
  fetchJs,
  connectorJs,
].join('\n');
