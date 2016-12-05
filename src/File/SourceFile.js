import React from 'react';


import _File from './_File';
import { Editor } from '../EditorPane/';


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

  static visible = _File.visible.concat(
    'isText',
    'text',
    'isScript',
    'blob'
  );

  get text() {
    return this.props.text;
  }

  get isScript() {
    return this.is('javascript');
  }

  get isModule() {
    return !this.options.isTrashed && !!this.moduleName;
  }

  get blob() {
    const { type, text } = this;
    return new Blob([text], { type });
  }

  get isText() {
    return true;
  }

  set(change) {
    const seed = Object.assign(this.serialize(), change);

    return new this.constructor(seed);
  }

  compose() {
    const serialized = this.serialize();
    serialized.composed = this.text;

    return Promise.resolve(serialized);
  }

  render(props) {
    return <Editor file={this} {...props} />
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
