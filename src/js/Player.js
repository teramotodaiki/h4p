import EventEmitter2 from 'eventemitter2';
import classNames from 'classnames';


import render from '../jsx/render';

const getClassName = (componentName) => CSS_PREFIX + 'frame_container-' + componentName;

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
    return render(this, this.config);
  }

  destroy() {
    const elem = this.rootElement;
    if (!elem || !elem.parentNode) return;
    elem.parentNode.removeChild(elem);
  }

  createRootElement(config) {
    const elem = document.createElement('div');
    elem.classList.add(classNames(config.className, getClassName('container')));
    document.body.appendChild(elem);
    return elem;
  }

  get computedStyle() {
    const element = this.config.rootElement;
    return element.currentStyle || document.defaultView.getComputedStyle(element);
  }

  show() { this.config.rootElement.style.visibility = 'visible'; }
  hide() { this.config.rootElement.style.visibility = 'hidden'; }
  toggle() { this.computedStyle.visibility === 'visible' ? this.hide() : this.show(); }

}
