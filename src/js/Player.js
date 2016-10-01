import EventEmitter2 from 'eventemitter2';
import classNames from 'classnames';


import render from '../jsx/render';


export default class Player extends EventEmitter2 {

  static defaultConfig = {
    width: '100vw',
    height: '100vh',
    url: 'https://embed.hackforplay.xyz/open-source/screen/alpha-6.html',
  };

  constructor(config = {}) {
    super();

    config.rootElement = config.rootElement || this.createRootElement(config);
    this.config = Object.assign({}, Player.defaultConfig, config);
  }

  start() {
    this.open();
    return render(this, this.config);
  }

  destroy() {
    const elem = this.rootElement;
    if (!elem || !elem.parentNode) return;
    elem.parentNode.removeChild(elem);
  }

  createRootElement(config) {
    const elem = document.createElement('div');
    elem.classList.add(classNames(config.className, CSS_PREFIX + 'container'));
    document.body.appendChild(elem);
    return elem;
  }

  get computedStyle() {
    const element = this.config.rootElement;
    return element.currentStyle || document.defaultView.getComputedStyle(element);
  }

  open() { this.config.rootElement.classList.add(CSS_PREFIX + 'container-open'); }
  close() { this.config.rootElement.classList.remove(CSS_PREFIX + 'container-open'); }
  toggle() { this.config.rootElement.classList.toggle(CSS_PREFIX + 'container-open'); }

}
