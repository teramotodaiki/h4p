import React from 'react';


import _File from './_File';
import configs from './configs';
import { SourceEditor } from '../EditorPane/';


export default class SourceFile extends _File {

  static defaultProps = {
    name: '.SourceFile',
    text: '',
    json: null,
    component: SourceEditor,
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

  get json() {
    if (!this.is('json')) {
      return null;
    }
    if (!this._json) {
      const model = Array.from(configs.values())
        .find((config) => config.test.test(this.name));
      const defaultValue = model ? model.defaultValue : {};
      try {
        this._json = Object.assign({}, defaultValue, JSON.parse(this.text));
      } catch (e) {
        return {};
      }
    }
    return this._json;
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
            name: file.name || SourceFile.defaultProps.name,
            text: e.target.result,
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
