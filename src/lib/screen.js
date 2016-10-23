;!function () {

const env = {};

// Un-checked parent origin
const _addEventListener = window.addEventListener;
window.addEventListener = (...args) => {
  if (args[0] === 'message' && typeof args[1] === 'function') {
    const _listener = args[1];
    args[1] = (...eArgs) => {
      const {data, source} = eArgs[0];
      if (source === parent) {
        eArgs[0] = {
          origin: '*', // Ignore origin check
          data, source
        };
      }
      return _listener.apply(window, eArgs);
    };
  }
  return _addEventListener.apply(window, args);
};

// Connect
new Postmate.Model({
  size: () => env.VIEW
})
.then(parent => {
  const { files } = parent.model;

  var view = null;

  Object.defineProperties(env, {
    // An abstract object/ Must implements "width" and "height" properties.
    VIEW: {
      configurable: true, enumerable: true,
      get: () => {
        const current = hasView(view) ? view : getComputedStyle(document.body);
        return {
          width: parseInt(current.width, 10),
          height: parseInt(current.height, 10)
        };
      },
      set: (value) => {
        view = value instanceof HTMLElement ? getComputedStyle(value) :
          hasView(value) ? value : null;
        parent.emit('resize', env.VIEW);
      }
    }
  });
  Object.assign(env, parent.model.env);
  define('env', () => env);

  window.fetch = localFetch(files);

  // require
  bundle(files)
  .then(() => {
    parent.emit('load')
  });

  // resizing
  window.addEventListener('resize', () => parent.emit('resize', env.VIEW));
});

function bundle(files) {
  const paths = files
    .filter(file => file.type === 'text/javascript')
    .map(convertAmd)
    .map(file => ({
      [file.moduleName] : URL.createObjectURL(getBlob(file))
    }));

  const config = {
    // alias
    map: { '*': Object.assign.apply(null, [{}].concat(paths)) }
  };

  const entryPoins = files
    .filter(file => file.options.isEntryPoint)
    .map(file => file.moduleName);

  return new Promise((resolve, reject) => {
    requirejs(config, entryPoins, resolve);
  });
}

function convertAmd(fileObj) {
  // AMD definision
  const text = `define(function (require, exports, module) {${fileObj.text}});`;
  return Object.assign({}, fileObj, { text });
}

function getBlob(fileObj) {
  return fileObj.isText ?
    new Blob([fileObj.text], { type: fileObj.type }) :
    fileObj.blob.slice(0, fileObj.blob.size, fileObj.blob.type);
}

function localFetch() {
  const _fetch = window.fetch;
  return function (...args) {
    const fetched = files.find(file => [file.name, file.moduleName].includes(args[0]));
    if (!fetched) {
      return _fetch.apply(this, args);
    }
    return new Promise((resolve, reject) => {
      const blob = getBlob(fetched);
      resolve(new Response(blob));
    });
  };
}

function hasView(view) {
  return view && typeof view === 'object' && 'width' in view && 'height' in view;
}

function getComputedStyle(elem) {
  return elem.currentStyle || document.defaultView.getComputedStyle(elem);
}

}();
