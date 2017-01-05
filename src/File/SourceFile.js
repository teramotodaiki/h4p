import React from 'react';
import md5 from 'md5';
import { parse } from './JSON6';


import _File from './_File';
import configs from './configs';
import { SourceEditor } from '../EditorPane/';
import download from '../html/download';


export default class SourceFile extends _File {

  static defaultProps = {
    name: '.SourceFile',
    text: '',
    json: null,
    component: SourceEditor,
    sign: null,
  };

  static defaultOptions = {
    isEntryPoint: false,
    isReadOnly: false,
    isTrashed: false,
    noBabel: false,
  }

  static visible = _File.visible.concat(
    'text',
    'isScript'
  );

  get text() {
    return this.props.text;
  }

  get isScript() {
    return this.is('javascript');
  }

  static blobCache = new WeakMap();
  get blob() {
    const { blobCache } = this.constructor;
    if (blobCache.has(this)) {
      return blobCache.get(this);
    }
    const blob = new Blob([this.text], { type: this.type });
    blobCache.set(this, blob);
    return blob;
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
        this._json = Object.assign({}, defaultValue, parse(this.text));
      } catch (e) {
        return {};
      }
    }
    return this._json;
  }

  _hash = null;
  get hash() {
    return this._hash = this._hash || md5(this.text);
  }

  set(change) {
    if (!change.text && this.hash) {
      change.hash = this.hash;
    }

    const seed = Object.assign(this.serialize(), change);

    return new this.constructor(seed);
  }

  compose() {
    const serialized = this.serialize();
    serialized.composed = this.text;
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

  static inlineScriptId = `feeles-inline-${CORE_VERSION}`;
  static coreLibFilename = `feeles-${CORE_VERSION}.js`;

  static embed({ TITLE, files, coreString }) {
    const body = `
    <script type="text/javascript" id="${SourceFile.inlineScriptId}">
    ${coreString.replace(/\<\//g, '<\\/')}
    </script>
    <script type="text/javascript">
    ${EXPORT_VAR_NAME}({ inlineScriptId: "${SourceFile.inlineScriptId}" });
    </script>
`;
    return new SourceFile({
      name: TITLE + '.html',
      type: 'text/html',
      text: download({
        CSS_PREFIX,
        TITLE,
        files,
        body,
      }),
    });
  }

  static divide({ TITLE, files }) {
    const head = `
    <script async src="${SourceFile.coreLibFilename}"></script>
`;
    return new SourceFile({
      name: TITLE + '.html',
      type: 'text/html',
      text: download({
        CSS_PREFIX,
        TITLE,
        files,
        head,
      }),
    });
  }

  static cdn({ TITLE, files, src = CORE_CDN_URL }) {
    const head = `
    <script async src="${src}" onload="${EXPORT_VAR_NAME}()"></script>
`;
    return new SourceFile({
      name: TITLE + '.html',
      type: 'text/html',
      text: download({
        CSS_PREFIX,
        TITLE,
        files,
        head,
      }),
    });
  }

  static library({ coreString }) {
    const text = `(function() {
  var e = document.createElement('script');
  e.id = "${SourceFile.inlineScriptId}";
  e.textContent = decodeURIComponent("${encodeURIComponent(coreString)}");
  document.body.appendChild(e);
  ${EXPORT_VAR_NAME}();
})();`;
    return new SourceFile({
      name: SourceFile.coreLibFilename,
      type: 'text/javascript',
      text,
    });
  }

}
