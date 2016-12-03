import SourceFile from './SourceFile';


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

}
