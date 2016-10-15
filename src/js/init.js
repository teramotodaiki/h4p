import Player from './Player';
import { makeFromElements } from './files';

// Initialize player from DOM
export default () =>
  Array.from(
    document.querySelectorAll(`.${CSS_PREFIX}app`)
  ).map(elem => {
    const scripts = document.querySelectorAll(elem.getAttribute('data-target'));
    return makeFromElements(scripts).then(files => {
      // An instance of h4p.Player
      const player = new Player({ files });
      player.start();
      return player;
    });
  });
