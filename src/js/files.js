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
  return loader(type, seed);
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
    isTrashed: script.hasAttribute('is-trashed'),
    noBabel: script.hasAttribute('no-babel'),
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
  const { name, type } = file;

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

/**
 * @param file An object
 * @param newName A string of new name without path and extension
 */
export const changeName = (file, newName) => {
  const { path, name, ext } = separate(file.name);
  const next = separate(path + newName + ext);

  return Object.assign({}, file, {
    name: next.name,
    moduleName: next.moduleName,
  });
};

/**
 * @param file An object
 * @param newPath A string of new path like 'sub/'
 */
export const changeDir = (file, newPath) => {
  const { path, plane, ext } = separate(file.name);
  const next = separate(newPath + plane + ext);

  return Object.assign({}, file, {
    name: next.name,
    moduleName: next.moduleName,
  });
};

export const separate = (fullpath) => {
  // Filename CAN'T contains spaces.
  fullpath = fullpath.replace(/\s/g, '');
  // Path separator
  fullpath = fullpath.replace(/:/g, '/');

  const pathLength = fullpath.lastIndexOf('/') + 1;
  const path = fullpath.substr(0, pathLength);
  const filename = fullpath.substr(pathLength);

  const planeLength = filename.includes('.') ?
    filename.lastIndexOf('.') : filename.length;
  const plane = filename.substr(0, planeLength);
  const ext = filename.substr(planeLength);

  const name = path + plane + ext;
  const moduleName = path + plane;

  return { path, plane, ext, name, moduleName };
};
