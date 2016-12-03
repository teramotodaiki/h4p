import SourceFile from './SourceFile';
import configs from './configs';


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

  _json = JSON.parse(this.text);
  get json() {
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

  static get(files, key) {
    if (!configs.has(key)) {
      throw new Error(`${key} is not exist in ConfigFiles`);
    }

    const { test, multiple, defaultValue } = configs.get(key);

    if (!multiple) {
      const file = files.find((file) => (
        !file.options.isTrashed && test.test(file.name)
      ));
      return Object.assign({}, defaultValue, file ? file.json : {});
    } else {
      return files.filter((file) => (
        !file.options.isTrashed && test.test(file.name)
      )).reduce((p, c) => {
        return Object.assign(p, c);
      }, Object.assign({}, defaultValue));
    }
  }

}
