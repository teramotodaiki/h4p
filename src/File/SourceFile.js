import _File from './_File';


export default class SourceFile extends _File {

  static defaultProps = {
    text: '',
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
    'text',
    'isScript'
  );

  get text() {
    return this.props.text;
  }

  get isScript() {
    return this.is('javascript');
  }

  isRunnable() {
    return !this.options.isTrashed;
  }

  isText() {
    return true;
  }

  set(change) {
    const seed = Object.assign(this.serialize(), change);

    return new SourceFile(seed);
  }

  compose() {
    const serialized = this.serialize();
    serialized.composed = this.text;

    return Promise.resolve(serialized);
  }

  /**
   * @param file File|Blob
   * @return Promise gives SourceFile
   */
  static load(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(
          new SourceFile({
            type: file.type,
            name: file.name,
            text: e.data.result,
          })
        );
      };
      reader.readAsText(file);
    });
  }

  static shot(text) {
    return new SourceFile({ type: 'text/javascript', name: '', text });
  }

}
