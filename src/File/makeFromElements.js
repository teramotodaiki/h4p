import md5 from 'md5';


import {
  BinaryFile,
  SourceFile,
  validateType
} from './';


/**
 * @param scripts An array of HTMLScriptElement (<script>)
 */
export default function makeFromElements(scripts) {
  return Promise.all(Array.from(scripts).map(makeFromElement));
}

function makeFromElement(script) {
  const name = script.getAttribute('name');
  const type = script.getAttribute('data-type');
  const options = {
    isEntryPoint: script.hasAttribute('is-entry-point'),
    isReadOnly: script.hasAttribute('is-read-only'),
    isTrashed: script.hasAttribute('is-trashed'),
    noBabel: script.hasAttribute('no-babel'),
  };
  const credits = script.hasAttribute('data-credits') ?
    JSON.parse(script.getAttribute('data-credits')) : [];

  const text = (code => {
    // Indent
    code = code
      .replace(/^\s*\<\!\-\-\n*/m, '')
      .replace(/\-\-\>\s*$/m, '');
    const spaces = /^\s*/.exec(code)[0];
    if (spaces) {
      code = code
        .split('\n')
        .map(s => s.indexOf(spaces) ? s :  s.substr(spaces.length))
        .join('\n');
    }
    return code;
  })(script.textContent);

  if (validateType('text', type)) {
    return new SourceFile({ type, name, text, options, credits });
  }
  if (validateType('blob', type)) {

    const bin = atob(text);
    let byteArray = new Uint8Array(bin.length);
    for (let i = bin.length - 1; i >= 0; i--) {
      byteArray[i] = bin.charCodeAt(i);
    }
    const blob = new Blob([byteArray.buffer], { type });
    const hash = md5(byteArray);

    return new BinaryFile({ type, name, blob, options, credits, hash });
  }

  return Promise.reject('Unknown File Type ' + type);
}
