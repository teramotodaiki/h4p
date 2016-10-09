import EventEmitter2 from 'eventemitter2';
import classNames from 'classnames';


import render from '../jsx/render';


export default class Player extends EventEmitter2 {

  static defaultConfig = {
    width: '100vw',
    height: '100vh'
  };

  constructor(config = {}, rootElement) {
    super();

    this.config = Object.assign({}, Player.defaultConfig, config);
    this.rootElement = rootElement || this.createRootElement(config);
  }

  start() {
    this.open();
    return render({
      player: this,
      config: this.config
    }, this.rootElement);
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
    const element = this.rootElement;
    return element.currentStyle || document.defaultView.getComputedStyle(element);
  }

  open() { this.rootElement.classList.add(CSS_PREFIX + 'container-open'); }
  close() { this.rootElement.classList.remove(CSS_PREFIX + 'container-open'); }
  toggle() { this.rootElement.classList.toggle(CSS_PREFIX + 'container-open'); }

}
