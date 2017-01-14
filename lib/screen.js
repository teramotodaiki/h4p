const promiseJs = require('raw!es6-promise/dist/es6-promise.auto');
const fetchJs = require('raw!whatwg-fetch');
const requireJs = require('raw!./require.js');
const connectorJs = require('raw!./connector');


export default function (module) {
  return [
    promiseJs,
    fetchJs,
    module ? requireJs : '',
    connectorJs,
  ].join('\n');
};
