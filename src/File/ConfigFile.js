import SourceFile from './SourceFile';
import configs from './configs';
import validateType from './validateType';


export default class ConfigFile extends SourceFile {

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

  static visible = SourceFile.visible;

  model = Array.from(configs.values())
    .find((config) => config.test.test(this.name));

  get json() {
    if (!this._json) {
      const { defaultValue } = this.model;
      this._json = Object.assign({}, defaultValue, JSON.parse(this.text));
    }
    return this._json;
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

  static isConfigFile(file) {
    const { name, type } = file;

    return validateType('config', type) &&
      Array.from(configs.values())
        .some(({ test }) => test.test(file.name));
  }

  static get (key) {
    if (!configs.has(key)) {
      throw new Error(`${key} is not exist in ConfigFiles`);
    }
    return configs.get(key);
  }

  static getFile(files, key) {
    const { test, multiple } = ConfigFile.get(key);

    const predicate = (file) => (
      !file.options.isTrashed && test.test(file.name)
    );

    return multiple ?
      files.filter(predicate) :
      files.find(predicate);
  }

  static getValue(files, key) {
    const target = ConfigFile.getFile(files, key);

    if (!target) {
      const { defaultValue } = ConfigFile.get(key);
      return defaultValue;
    }

    return target instanceof Array ?
      ConfigFile.get(key).bundle(target) :
      target.json;
  }

}
