import _File from './_File';


export default class ConfigFile extends _File {

  static defaultProps = {
    type: 'application/json',
    text: '{}',
    json: {},
  };

  static defaultOptions = {
    isEntryPoint: false,
    isReadOnly: true,
    isTrashed: false,
    noBabel: false,
  }

  static defaultAuthor = {
    name: '',
    url: '',
  };

  get text() {
    return this.props.text;
  }

  _json = JSON.parse(this.text);
  get json() {
    return this._json;
  }

  isText() {
    return true;
  }

  set(change) {
    const seed = Object.assign(this.serialize(), {
      text: this.text,
    }, change);

    return new ConfigFile(seed);
  }

  compose() {
    const serialized = this.serialize();
    serialized.composed = JSON.stringify(this.json);

    return Promise.resolve(serialized);
  }

}
