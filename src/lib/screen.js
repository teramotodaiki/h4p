;!function () {

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


const getComputedStyle = (elem) => elem.currentStyle || document.defaultView.getComputedStyle(elem);

const Hack = new EventEmitter2();


// An abstract object/ Must implements "width" and "height" properties.
var view = null;
Object.defineProperty(Hack, 'view', {
  get: () => ({ width: parseInt(view.width, 10), height: parseInt(view.height, 10) }),
  set: (value) => {
    const old = view;
    view = value instanceof HTMLElement ? getComputedStyle(value) : value;
    Hack.emit('viewchange', old, value);
  }
});

window.addEventListener('load', () => Hack.view = document.body); // default

// Utility/ Create primary canvas
Hack.createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.margin = 0;
  canvas.style.padding = 0;
  document.body.appendChild(canvas);
  Hack.view = canvas;

  return canvas;
};


// Connect
const handshake = new Postmate.Model({
  size: () => Hack.view
});

handshake.then(parent => {

  Hack.parent = parent; // export to global

  // require
  loadAsync(parent.model.files);

  // resizing
  window.addEventListener('resize', () => parent.emit('resize', Hack.view));
  Hack.on('viewchange', () => parent.emit('resize', Hack.view));
  Hack.on('load', () => parent.emit('load'));
});


const scriptLoader = (file) => {
  const content =
    // AMD definision
    `define(function (require, exports, module) {${file.text}});`;

  return URL.createObjectURL(new Blob([content]));
};


const loadAsync = (files) => {

  const _fetch = window.fetch;
  window.fetch = function (...args) {
    const fetched = files.find(file => file.name === args[0]);
    if (!fetched) {
      return _fetch.apply(this, args);
    }
    return new Promise((resolve, reject) => {
      const blob = fetched.isText ?
        new Blob([fetched.text], { type: fetched.type }) :
        fetched.blob.slice(0, fetched.blob.size, fetched.blob.type);
      resolve(new Response(blob));
    });
  };

  const paths = files
    .filter(file => file.type === 'text/javascript')
    .map(file => ({ [file.name]: scriptLoader(file) }));

  const config = {
    // alias
    map: { '*': Object.assign.apply(null, [{}].concat(paths)) }
  };

  const entryPoins = files
    .filter(file => file.options.isEntryPoint)
    .map(file => file.name);

  // config, deps, callback
  requirejs(config, entryPoins, () => {
    Hack.emit('load');
  });
};

// Export
window.Hack = Hack;

}();
