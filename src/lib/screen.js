;!function () {

const env = {};

// Connect
new Promise((resolve, reject) => {
  window.addEventListener('message', (event) => {
    if (!event.ports) return;

    resolve({
      port: event.ports[0],
      model: event.data,
    });
  });
})
.then(({ port, model }) => {
  const emit = (query, value) => port.postMessage({ query, value });

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
        emit('resize', env.VIEW);
      }
    }
  });
  Object.assign(env, model.env);
  define('env', () => env);

  port.onmessage = (e) => {
    switch (e.data.query) {
      case 'shot':
        eval(e.data.value);
        break;
    }
  };

  window.fetch = localFetch(model.files);

  bundle(model.files)
  .then(() => {
    emit('resize', env.VIEW);
  });
})
.catch((err) => console.error('eee!', err));

function bundle(files) {

  files
    .filter(file => file.type === 'text/javascript')
    .forEach(file => {
      define(
        file.moduleName,
        new Function('require, exports, module', file.text)
      );
    });

  const config = {
    // alias
    // map: { '*': {} }
  };

  const entryPoins = files
    .filter(file => file.options.isEntryPoint)
    .map(file => file.moduleName);

  return new Promise((resolve, reject) => {
    requirejs(config, entryPoins, resolve);
  });
}

function getBlob(fileObj) {
  return fileObj.isText ?
    new Blob([fileObj.text], { type: fileObj.type }) :
    fileObj.blob.slice(0, fileObj.blob.size, fileObj.blob.type);
}

function localFetch(files) {
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
