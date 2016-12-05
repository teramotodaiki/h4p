import {
  BinaryFile,
  ConfigFile,
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
  const author = {
    name: script.getAttribute('author-name'),
    url: script.getAttribute('author-url'),
  };
  const text = (code => {
    // Indent
    code = code.replace(/^\n*/g, '');
    const spaces = /^\s*/.exec(code)[0];
    if (spaces) {
      code = code
        .split('\n')
        .map(s => s.indexOf(spaces) ? s :  s.substr(spaces.length))
        .join('\n');
    }
    return code;
  })(script.textContent);

  if (ConfigFile.isConfigFile({ name, type })) {
    return new ConfigFile({ type, name, text, options, author });
  }
  if (validateType('text', type)) {
    return new SourceFile({ type, name, text, options, author });
  }
  if (validateType('blob', type)) {

    const bin = atob(text);
    let byteArray = new Uint8Array(bin.length);
    for (let i = bin.length - 1; i >= 0; i--) {
      byteArray[i] = bin.charCodeAt(i);
    }
    const blob = new Blob([byteArray.buffer], { type });

    return new BinaryFile({ type, name, blob, options, author });
  }

  return Promise.reject('Unknown File Type' . file.type);
}
