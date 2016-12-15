;!function () {
  // global var
  window.feeles = {
    // An array of stocks for feeles.export
    exports: [],
  };

  var getUniqueId = (function (id) {
    return function () { return 'FEELES_UNIQ_ID-' + ++id };
  })(0);

  /**
   * @return Promise ({ port, model })
   */
  var connected = new Promise(function(resolve, reject) {
    window.addEventListener('message', function (event) {
      if (!event.ports) return;

      resolve({
        port: event.ports[0],
        model: event.data
      });
    });
  });

  // Connect
  connected.then(function (_ref) {
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
          var text = declarateVars(feeles.exports) + '\n' + e.data.value.text;
          requirejs(['require', 'exports', 'module'], new Function('require, exports, module', text));
          break;
      }
    };

    // Backward Compatibility
    window.fetch = localFetch(model.files);

    bundle(model.files)
    .then(function () {
      emit('resize', env.VIEW);
      const completes = Array.prototype.concat.apply([],
        feeles.exports.map(function (keyValueMap) {
          return Object.keys(keyValueMap);
        })
      );
      emit('complete', completes);
    }).catch(function (err) {
      console.error('feeles: BundleError', model.files);
      throw err;
    });
  }).catch(function (err) {
    return console.error('feeles: Error in launch', err);
  });


  feeles.fetch = function (name) {
    return connected.then(function (_ref) {
      var port = _ref.port;
      return new Promise(function(resolve, reject) {
        var id = getUniqueId();
        port.addEventListener('message', function task(event) {
          if (event.data.id !== id) return;
          port.removeEventListener('message', task);
          if (event.data.error) {
            reject();
          } else {
            resolve(new Response(event.data.value));
          }
        });
        port.postMessage({
          query: 'fetch',
          id: id,
          value: name,
        });
      });
    });
  };

  feeles.saveAs = function (blob, name) {
    return connected.then(function (_ref) {
      var port = _ref.port;

      port.postMessage({
        query: 'saveAs',
        value: [blob, name],
      });
    })
  };


  function bundle(files) {

    files.filter(function (file) {
      return file.isScript;
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

  // Backward Compatibility
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
      return Promise.resolve(new Response(fetched.blob));
    };
  }

  function hasView(view) {
    return view && typeof view === 'object' && 'width' in view && 'height' in view;
  }

  function declarateVars(array) {
    const declarates = array.map(function (object, i) {
      return Object.keys(object).map(function (key) {
        return key + ' = feeles.exports[' + i + ']["' + key + '"]';
      }).join(',');
    }).filter(function (line) {
      return !!line;
    }).join(',');
    return declarates ? 'var ' + declarates + ';' : '';
  }
}();
