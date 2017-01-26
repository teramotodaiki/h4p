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

  static watchProps = [
    'name',
    'moduleName',
    'type',
    'isTrashed'
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
      return this.text
        .trim() // 前後の空白を削除
        .replace(/\n[^]*$/, '') // 改行以降を削除
        .trim() // 前後の空白を削除
        .replace(/^[\#\-]*\s*/, '') // 行頭の # - を削除
        .replace(/[\*\~\_\[\]\(\)\`]/g, '') // * ~ _ [] () `` を削除
        ;
    }
    return this.plane + this.ext;
  }

  get credits() {
    return this.props.credits instanceof Array ?
      this.props.credits : [];
  }

  get sign() {
    return this.props.sign;
  }

  get credit() {
    const credit = this.credits.find((item) => item.hash === this.hash);
    if (credit) {
      return credit;
    }

    return this.sign || null;
  }

  get isTrashed() {
    return !!this.options.isTrashed;
  }

  static _dataURLCache = new WeakMap();
  async toDataURL() {
    const { _dataURLCache } = this.constructor;

    if (_dataURLCache.has(this)) {
      return _dataURLCache.get(this);
    }
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const { result } = reader;
        _dataURLCache.set(this, result);
        resolve(result);
      };
      reader.readAsDataURL(this.blob);
    });
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

  watchSerialize() {
    const obj = Object.create(null);
    this.constructor.watchProps.forEach((key) => {
      obj[key] = this[key];
    });
    return obj;
  }

}

const getUniqueId = (i => () => '_File__' + ++i)(0);
