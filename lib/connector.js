;!function () {

  // Connect
  new Promise(function (resolve, reject) {
    window.addEventListener('message', function (event) {
      if (!event.ports) return;

      resolve({
        port: event.ports[0],
        model: event.data
      });
    });
  }).then(function (_ref) {
    var port = _ref.port;
    var model = _ref.model;
    var env = model.env;

    var emit = function emit(query, value) {
      return port.postMessage({ query: query, value: value });
    };

    var view = null;

    Object.defineProperties(env, {
      // An abstract object/ Must implements "width" and "height" properties.
      VIEW: {
        configurable: true, enumerable: true,
        get: function get() {
          var current = hasView(view) ? view : getComputedStyle(document.body);
          return {
            width: parseInt(current.width, 10),
            height: parseInt(current.height, 10)
          };
        },
        set: function set(value) {
          view = value instanceof HTMLElement ? getComputedStyle(value) : hasView(value) ? value : null;
          emit('resize', env.VIEW);
        }
      }
    });

    define('env', function () {
      return env;
    });

    port.onmessage = function (e) {
      switch (e.data.query) {
        case 'shot':
          requirejs(['require', 'exports', 'module'], new Function('require, exports, module', e.data.value.text));
          break;
      }
    };

    window.fetch = localFetch(model.files);

    bundle(model.files)
    .then(function () {
      emit('resize', env.VIEW);
    })
    .catch(function (err) {
      console.error('feeles: BundleError', model.files);
      throw err;
    });
  }).catch(function (err) {
    return console.error('feeles: Error in launch', err);
  });

  function bundle(files) {

    files.filter(function (file) {
      return file.type === 'text/javascript';
    }).forEach(function (file) {
      define(file.moduleName, new Function('require, exports, module', file.text));
    });

    var config = {
      // alias
      // map: { '*': {} }
    };

    var entryPoins = files.filter(function (file) {
      return file.options.isEntryPoint;
    }).map(function (file) {
      return file.moduleName;
    }).concat('env');

    return new Promise(function (resolve, reject) {
      requirejs(config, entryPoins, resolve);
    });
  }

  function getBlob(fileObj) {
    return fileObj.isText ? new Blob([fileObj.text], { type: fileObj.type }) : fileObj.blob.slice(0, fileObj.blob.size, fileObj.blob.type);
  }

  function localFetch(files) {
    var _fetch = window.fetch;
    return function (url, options) {
      var fetched = null;
      files.forEach(function (file) {
        if (!fetched && (file.name === url || file.moduleName === url)) {
          fetched = file;
        }
      });
      if (!fetched) {
        return _fetch(url, options);
      }
      return new Promise(function (resolve, reject) {
        var blob = getBlob(fetched);
        resolve(new Response(blob));
      })
      .catch((err) => {
        console.error('feeles: LocalFetchError', url, fetched);
      });
    };
  }

  function hasView(view) {
    return view && typeof view === 'object' && 'width' in view && 'height' in view;
  }
}();
