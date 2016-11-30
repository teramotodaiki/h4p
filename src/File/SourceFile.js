import _File from './_File';


export default class SourceFile extends _File {

  static defaultProps = {
    text: '',
  };

  get text() {
    return this.props.text;
  }

  isText() {
    return true;
  }

  set(change) {
    const seed = Object.assign(this.serialize(), {
      text: this.text,
    }, change);

    return new SourceFile(seed);
  }

  compose() {
    const serialized = this.serialize();
    serialized.composed = this.text;

    return Promise.resolve(serialized);
  }

}
