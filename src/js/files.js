import fileLoaders, { merger } from './fileLoaders';

/**
 * @param seed An object has some params
 */
export const copy = (seed) => merger(seed);

/**
 * @param type A string of the file type
 * @param seed An object has some params
 */
export const makeFromType = (type, seed = {}) => {
  const loader = fileLoaders.find(ft => type.search(ft.test) === 0).loader;
  if (loader === null) {
    Promise.reject(new Error(`Invalid file type: ${type}. See the src/js/fileLoaders.js`));
    return;
  }
  return loader(seed);
};

/**
 * @param scripts An element of HTMLScriptElement (<script>)
 */
export const makeFromElement = (script) => {
  const name = script.getAttribute('name');
  const type = script.getAttribute('data-type');
  const options = {
    isEntryPoint: script.hasAttribute('is-entry-point'),
    isReadOnly: script.hasAttribute('is-read-only'),
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

  return makeFromType(type, { name, text, options });
}

/**
 * @param scripts Array of HTMLScriptElement (<script>)
 */
export const makeFromElements = (scripts) => {
  return Promise.all(Array.from(scripts).map(script => makeFromElement(script)));
};

/**
 * @param file A file instance implements HTML5 File API
 */
export const makeFromFile = (file) => {
  const filename = file.name;
  const extBegin = filename.lastIndexOf('.');
  const name = extBegin > 0 ? filename.substr(0, extBegin) : filename;
  const type = file.type;

  return makeFromType(type, { name, type, blob: file });
};

export const compose = (file) => {
  const composer = fileLoaders.find(ft => file.type.search(ft.test) === 0).composer;
  if (composer === null) {
    Promise.reject(new Error(`Invalid file type: ${type}. See the src/js/fileLoaders.js`));
    return;
  }
  return composer(file).then(composed => Object.assign({}, file, { composed }));
};
