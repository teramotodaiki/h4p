import { separate, validateType } from './';


export default class _File {

  static defaultProps = {};

  static defaultOptions = {};

  static defaultAuthor = {};

  static serialize = [
    'key',
    'name',
    'moduleName',
    'type',
    'options',
    'author'
  ];

  constructor(props) {
    this.key = props.key || getUniqueId();

    const lock = (...args) => Object.freeze(
      Object.assign({}, ...args)
    );
    this.props = lock(this.constructor.defaultProps, props);
    this.options = lock(this.constructor.defaultOptions, this.props.options);
    this.author = lock(this.constructor.defaultAuthor, this.props.author);

    this._separate = separate(props.name);
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

  is(name) {
    return validateType(name, this.type);
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
    this.constructor.serialize.forEach((key) => {
      obj[key] = this[key];
    });
    return obj;
  }

}

const getUniqueId = (i => () => '_File__' + ++i)(0);
