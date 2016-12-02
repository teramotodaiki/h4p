import _File from './_File';


export default class ConfigFile extends _File {

  static defaultProps = {
    type: 'application/json',
    text: '{}',
    json: {},
  };

  static defaultOptions = {
    isEntryPoint: false,
    isReadOnly: false,
    isTrashed: false,
    noBabel: false,
  }

  static defaultAuthor = {
    name: '',
    url: '',
  };

  static serialize = _File.serialize.concat(
    'isText',
    'text'
  );

  get text() {
    return this.props.text;
  }

  _json = JSON.parse(this.text);
  get json() {
    return this._json;
  }

  get isRunnable() {
    return false;
  }

  get isText() {
    return true;
  }

  set(change) {
    const seed = Object.assign(this.serialize(), change);

    return new ConfigFile(seed);
  }

  compose() {
    const serialized = this.serialize();
    serialized.composed = JSON.stringify(this.json);

    return Promise.resolve(serialized);
  }

  /**
   * @param file File|Blob
   * @return Promise gives ConfigFile
   */
  static load(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(
          new ConfigFile({
            type: file.type,
            name: file.name,
            text: e.data.result,
          })
        );
      };
      reader.readAsText(file);
    });
  }

}
