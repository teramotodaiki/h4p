import { separate, validateType } from './';
import babelWorker from '../workers/babel-worker';


export default class _File {

  static defaultProps = {};

  static defaultOptions = {};

  static visible = [
    'key',
    'name',
    'moduleName',
    'type',
    'options',
    'credits',
    'sign'
  ];

  constructor(props) {
    this.key = props.key || getUniqueId();

    const lock = (...args) => Object.freeze(
      Object.assign({}, ...args)
    );
    this.props = lock(this.constructor.defaultProps, props);
    this.options = lock(this.constructor.defaultOptions, this.props.options);

    this._separate = separate(this.props.name);
  }

  get name() {
    return this._separate.name;
  }

  get moduleName() {
    return this._separate.moduleName;
  }

  get path() {
    return this._separate.path;
  }

  get plane() {
    return this._separate.plane;
  }

  get ext() {
    return this._separate.ext;
  }

  get type() {
    return this.props.type;
  }

  get component() {
    return this.props.component;
  }

  get header() {
    if (this.is('markdown')) {
      return this.text.replace(/^[\#\s]*/, '')
        .split('\n')[0] || '';
    }
    return this.plane + this.ext;
  }

  get sign() {
    return this.props.sign;
  }

  get credit() {
    if (this.props.credits && this.hash) {
      const credit = this.props.credits.find((item) => item.hash === this.hash);
      if (credit) {
        return credit;
      }
    }
    return this.sign || null;
  }

  get error() {
    return this.constructor._babelError.get(this);
  }

  is(name) {
    return validateType(name, this.type);
  }

  static _babelCache = new WeakMap();
  static _babelConfig = null;
  static _babelError = new WeakMap();
  babel(config) {
    const { _babelCache, _babelConfig, _babelError } = this.constructor;
    if (_babelConfig === config) {
      if (_babelCache.has(this))
        return _babelCache.get(this);
      if (_babelError.has(this))
        throw _babelError.get(this);
    } else {
      this.constructor._babelConfig = config;
    }

    const promise = babelWorker(this, config)
      .catch((err) => {
        _babelError.set(this, err);
        throw err;
      });
    _babelCache.set(this, promise);
    return promise;
  }

  rename(newName) {
    const { path, ext } = this;
    const name = path + newName + ext;

    return this.set({ name });
  }

  move(newPath) {
    if (newPath.lastIndexOf('/') !== newPath.length - 1) {
      newPath += '/';
    }

    const { plane, ext } = this;
    const name = newPath + plane + ext;

    return this.set({ name });
  }

  serialize() {
    const obj = Object.create(null);
    this.constructor.visible.forEach((key) => {
      obj[key] = this[key];
    });
    return obj;
  }

}

const getUniqueId = (i => () => '_File__' + ++i)(0);
