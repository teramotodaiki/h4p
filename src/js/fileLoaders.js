import { separate } from './files';

export default [
  {
    test: /^(text|application)\/json$/,
    loader: (type, seed) => textLoader(type, seed).then(jsonLoader),
    composer: (file) => Promise.resolve(file.text)
  },
  {
    test: /^(text|application)\//,
    loader: (type, seed) => textLoader(type, seed),
    composer: (file) => Promise.resolve(file.text)
  },
  {
    test: /^(image|audio|video)\//,
    loader: (type, seed) => blobLoader(type, seed),
    composer: (file) => blobToBase64(file.blob)
  },
  {
    test: /^/,
    loader: (type, seed) => textLoader('text/plain', seed),
    composer: (file) => Promise.resolve(file.text)
  }
];

export const defaultValue = {
  key: null,
  name: '',
  moduleName: '',
  type: '',
  isText: true,
  text: '',
  blob: null,
  blobURL: null,
  options: {
    isEntryPoint: false,
    isReadOnly: false,
    isTrashed: false,
    noBabel: false,
  },
  author: {
    name: '',
    url: '',
  },
};

const getUniqueId = (i => () => ++i)(0);

export const merger = (...args) => {
  const parts = [{}].concat(defaultValue).concat(args);
  const file = Object.assign.apply(null, parts); // merge objects
  file.key = getUniqueId(); // unique key (Number)
  return file;
};


export const textLoader = (type, seed) =>
  new Promise((resolve, reject) => {
    if (sanitize(seed, reject)) return;

    const path = separate(seed.name);

    // when Blob => text, it must be asynchronous
    new Promise((resolve, reject) => {
      if (typeof seed.text === 'string') {
        resolve(seed.text);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsText(seed.blob);
    })
    .then(text => resolve(merger({
      name: path.name,
      moduleName: path.moduleName,
      type,
      isText: true,
      text,
      options: Object.assign({}, defaultValue.options, seed.options)
    })));
  });

export const blobLoader = (type, seed) =>
  new Promise((resolve, reject) => {
    if (sanitize(seed, reject)) return;

    const blob = seed.blob || (base64 => {
      var bin = atob(base64);
      var byteArray = new Uint8Array(bin.length);
      for (var i = bin.length - 1; i >= 0; i--) {
        byteArray[i] = bin.charCodeAt(i);
      }
      return new Blob([byteArray.buffer], { type });
    })(seed.text);

    const path = separate(seed.name);

    resolve(merger({
      name: path.name,
      moduleName: path.moduleName,
      type,
      isText: false,
      blob,
      blobURL: URL.createObjectURL(blob),
      options: Object.assign({}, defaultValue.options, seed.options)
    }));
  });

export const jsonLoader = (file) =>
  new Promise((resolve, reject) => {
    const json = JSON.parse(file.text);
    resolve(Object.assign({}, file, { json }));
  });

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const { result } = event.target;
      resolve(result.substr(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });

const sanitize = (seed, reject) => {
  if (typeof seed.text !== 'string' && !seed.blob) {
    reject(new Error(`Needed text or blob, but given: ${JSON.stringify(seed)}`));
    return true;
  }
  return false;
};
