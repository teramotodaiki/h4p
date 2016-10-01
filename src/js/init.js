import Player from './Player';

// Initialize player from DOM
export default () =>
  Array.from(
    document.querySelectorAll(`.${CSS_PREFIX}app`)
  ).map(elem => {
    const scripts = document.querySelectorAll(elem.getAttribute('data-target'));
    return {
      files: Array.from(scripts).map(script => {
        const name = script.getAttribute('name');
        const filename = name + '.js';
        const code = indent(script.textContent);
        const isEntryPoint = script.hasAttribute('is-entry-point');
        const isReadOnly = script.hasAttribute('is-read-only');
        const isOpened = script.hasAttribute('is-opened');
        return { name, filename, code, isEntryPoint, isReadOnly, isOpened };
      })
    };
  })
  .map(config => {
    // An instance of h4p.Player
    const player = new Player(config);
    player.start();
    return player;
  });

const indent = (code) => {
  code = code.replace(/^\n*/g, '');
  const spaces = /^\s*/.exec(code)[0];
  if (spaces) {
    code = code
      .split('\n')
      .map(s => s.indexOf(spaces) ? s :  s.substr(spaces.length))
      .join('\n');
  }
  return code;
};
