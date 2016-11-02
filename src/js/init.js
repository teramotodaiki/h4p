import Player from './Player';
import { makeFromElements, makeFromType } from './files';


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
      palette,
    } = (elem => {
      if (!elem) return {};
      const exported = JSON.parse(elem.textContent);
      return {
        palette: exported.palette,
      };
    })(document.querySelector('x-exports' + elem.getAttribute('data-target') + '__exports'));

    return makeFromElements(scripts)
      .then(files => {
        // An instance of h4p.Player
        const player = new Player({ files, palette });
        player.start();
        return player;
      });
  });
}
