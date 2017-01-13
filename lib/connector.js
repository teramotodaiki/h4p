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
          var current = hasView(view) ? view : getComputedStyle(document.documentElement);
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

    env.VIEW = document.documentElement;

    var resizeDetection = (function (_width, _height) {
      return function () {
        var view = env.VIEW;
        if (view.width !== _width || view.height !== _height) {
          emit('resize', env.VIEW);
          _width = view.width;
          _height = view.height;
        }
        requestAnimationFrame(resizeDetection);
      };
    })(env.VIEW.width, env.VIEW.height);
    requestAnimationFrame(resizeDetection);

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

    setTimeout(function () {
      var completes = Array.prototype.concat.apply([],
        feeles.exports.map(function (keyValueMap) {
          return Object.keys(keyValueMap);
        })
      );
      emit('complete', completes);
    }, 100);

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
            reject('Not found error in feeles.fetch: ' + name);
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

  var OriginalXHR = window.XMLHttpRequest;
  feeles.XMLHttpRequest = function(options) {
    var xhr = new OriginalXHR(options);
    xhr.open = feelesXHROpen;
    return xhr;
  };
  function feelesXHROpen() {
    if (arguments[2] === false) {
      throw new Error('feeles.XMLHttpRequest does not support synchronization requests.');
    }
    var openArgs = Array.prototype.slice.call(arguments);
    var self = this;
    self.send = function () {
      var sendArgs = arguments;
      feeles.fetch(openArgs[1])
        .then(function (response) {
          return response.blob();
        })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var revoke = function () {
            URL.revokeObjectURL(url);
          };
          onceEventListener(self, ['abort', 'load', 'error'], revoke);
          openArgs[1] = url;
          OriginalXHR.prototype.open.apply(self, openArgs);
          OriginalXHR.prototype.send.apply(self, sendArgs);
        });
    };
  };

  feeles.saveAs = function (blob, name) {
    return connected.then(function (_ref) {
      var port = _ref.port;

      port.postMessage({
        query: 'saveAs',
        value: [blob, name],
      });
    });
  };

  feeles.reload = function () {
    return connected.then(function (_ref) {
      var port = _ref.port;

      port.postMessage({
        query: 'reload',
      });
    });
  };

  feeles.replace = function (url) {
    return connected.then(function (_ref) {
      var port = _ref.port;
      port.postMessage({
        query: 'replace',
        value: url,
      });
    });
  };

  [
    HTMLAnchorElement,
    HTMLAreaElement
  ].forEach(function (constructor) {
    var desc = Object.getOwnPropertyDescriptor(constructor.prototype, 'href');
    Object.defineProperty(constructor.prototype, 'href', {
      set: hrefSetter,
    });
    function hrefSetter(href) {
      var replace = 'javascript: feeles.replace("' + href + '");';
      desc.set.call(this, replace);
    }
  });

  [
    HTMLImageElement,
    HTMLAudioElement,
    HTMLScriptElement
  ].forEach(function (constructor) {
    var desc = Object.getOwnPropertyDescriptor(constructor.prototype, 'src');
    Object.defineProperty(constructor.prototype, 'src', {
      set: srcSetter,
    });
    function srcSetter(src) {
      var self = this;
      // Check path absolute or relative
      var a = document.createElement('a');
      a.href = src;
      if (a.href === src) {
        // If absolute path:
        desc.set.call(self, src);
      } else {
        // If relative path:
        feeles.fetch(src)
          .then(function (response) {
            return response.blob();
          })
          .then(function (blob) {
            var url = URL.createObjectURL(blob);
            var revoke = function () {
              URL.revokeObjectURL(url);
            };
            onceEventListener(self, ['load', 'error'], revoke);
            desc.set.call(self, url);
          });
      }
    }
  });

  requirejs.onError = function (error) {
    var message;
    if (typeof error === 'object') {
      message = 'Error: "' +
        error.message +
        '"' +
        (error.requireMap ? ' in ' + error.requireMap.name + '.js' : '');
    } else {
      message = error + '';
    }

    connected.then(function (_ref) {
      var port = _ref.port;

      port.postMessage({
        query: 'error',
        message: message,
      });
    });
  };

  function hasView(view) {
    return view && typeof view === 'object' && 'width' in view && 'height' in view;
  }

  function declarateVars(array) {
    var declarates = array.map(function (object, i) {
      return Object.keys(object).map(function (key) {
        return key + ' = feeles.exports[' + i + ']["' + key + '"]';
      }).join(',');
    }).filter(function (line) {
      return !!line;
    }).join(',');
    return declarates ? 'var ' + declarates + ';' : '';
  }

  /**
   * 1回しか dispatch されない EventListener を追加する
   * @param target:EventTarget
   * @param names:Array<String> ['load', 'error'] など、イベント名の配列
   * @param handler:Function
   */
  function onceEventListener(target, names, handler) {
    var once = function () {
      names.forEach(function (name) {
        target.removeEventListener(name, once);
      });
      handler.apply(this, arguments);
    };
    names.forEach(function (name) {
      target.addEventListener(name, once);
    });
  }
}();
