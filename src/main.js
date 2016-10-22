import Player from './js/Player';
import init from './js/init';

require('./scss/main');

const h4p = (...args) =>
  new Promise((resolve, reject) => {
    document.readyState === 'complete' ?
      resolve(init(...args)) :
      addEventListener('load', () => {
        return resolve(init(...args));
      });
  });

h4p.init = init;
h4p.Player = Player;

// export
module.exports = h4p;
