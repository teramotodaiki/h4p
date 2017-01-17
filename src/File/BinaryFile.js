import React from 'react';
import md5 from 'md5';


import _File from './_File';
import { Preview } from '../EditorPane/';


export default class BinaryFile extends _File {

  static defaultProps = {
    name: '.BinaryFile',
    blob: null,
    component: Preview,
    sign: null,
  };

  static defaultOptions = {
    isReadOnly: true,
    isTrashed: false,
    noBabel: false,
  }

  static visible = _File.visible.concat(
    'blob',
    'blobURL'
  );

  static watchProps = _File.watchProps.concat(
  );

  constructor(props) {
    if (props.blob && !props.blobURL) {
      const blobURL = URL.createObjectURL(props.blob);
      props = Object.assign({}, props, { blobURL });
    }

    super(props);
  }

  get blob() {
    return this.props.blob;
  }

  get blobURL() {
    return this.props.blobURL;
  }

  get hash() {
    return this.props.hash;
  }

  set(change) {
    if (!change.blob && this.hash) {
      change.hash = this.hash;
    }
    const seed = Object.assign(this.serialize(), change);

    return new BinaryFile(seed);
  }

  async compose() {
    const serialized = this.serialize();
    if (this.sign && this.sign === this.credit) {
      const sign = Object.assign({}, this.sign, {
        timestamp: new Date().getTime(),
        hash: this.hash,
      });
      serialized.credits = JSON.stringify(
        this.credits.concat(sign)
      );
    } else {
      serialized.credits = JSON.stringify(this.credits);
    }
    const dataURL = await this.toDataURL();
    serialized.composed = dataURL.substr(dataURL.indexOf(',') + 1);

    return serialized;
  }

  /**
   * @param file File|Blob
   * @return Promise gives BinaryFile
   */
  static load(file) {
    return new Promise((resolve, reject) => {
        // get hash of TypedArray from binary
        const reader = new FileReader();
        reader.onload = (e) => {
          const typedArray = new Uint8Array(e.target.result);
          const hash = md5(typedArray);
          resolve(hash);
        };
        reader.readAsArrayBuffer(file);
      })
      .then((hash) => new BinaryFile({
        type: file.type,
        name: file.name || BinaryFile.defaultProps.name,
        blob: file,
        hash,
      }));
  }

}
