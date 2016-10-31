import Player from './Player';
import { makeFromElements, makeFromType } from './files';
import { importEnv } from './env';

// Initialize player from DOM
export default () => {

  window.addEventListener('beforeunload', (event) => {
    if (process.env.NODE_ENV === 'production') {
      event.returnValue = "Stop! You can't return later!";
      return event.returnValue;
    }
  });

  return Array.from(
    document.querySelectorAll(`.${CSS_PREFIX}app`)
  ).map(elem => {
    const scripts = document.querySelectorAll('script' + elem.getAttribute('data-target'));
    const {
      env,
      palette,
      shot,
    } = (elem => {
      if (!elem) return {};
      const exported = JSON.parse(elem.textContent);
      return {
        env: importEnv(exported.env),
        palette: exported.palette,
        shot: Object.assign({}, exported.shot || {}, {
          name: '', text: ''
        }),
      };
    })(document.querySelector('x-exports' + elem.getAttribute('data-target') + '__exports'));

    return Promise.all([
      makeFromElements(scripts),
      makeFromType('text/javascript', shot),
    ])
    .then(([files, shot]) => {
      // An instance of h4p.Player
      const player = new Player({ files, env, palette, shot });
      player.start();
      return player;
    });
  });
}
