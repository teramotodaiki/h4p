import Postmate from 'postmate';


// Un-checked parent origin
const _addEventListener = window.addEventListener;
window.addEventListener = function () {
  var args = Array.prototype.slice.call(arguments);
  if (args[0] === 'message' && typeof args[1] === 'function') {
    const _listener = args[1];
    args[1] = function () {
      var eArgs = Array.prototype.slice.call(arguments);
      if (eArgs[0].source === parent) {
        eArgs[0] = {
          origin: '*', // Ignore origin check
          data: eArgs[0].data,
          source: eArgs[0].source
        };
      }
      return _listener.apply(window, eArgs);
    };
  }
  return _addEventListener.apply(window, args);
};


// Postmateのconstructorを再現し、this.frame.onloadをoverrideする
const MESSAGE_TYPE = 'application/x-postmate-v1+json';
export default class _Postmate {
  constructor(userOptions) {
    // superをコールするとthisがsendHandshakeの戻り値になるため、コールしない
    const _this = {};

    // base constructor
    const { container, url, model } = userOptions;

    _this.parent = window;
    _this.frame = document.createElement('iframe');
    (container || document.body).appendChild(_this.frame);
    _this.child = _this.frame.contentWindow;
    _this.model = model || {};

    const handshake = Postmate.prototype.sendHandshake.call(_this, url);

    _this.frame.onload = function () {
      return _this.child.postMessage({
        postmate: 'handshake',
        type: MESSAGE_TYPE,
        model: _this.model,
      }, '*');
    };

    return handshake.then(parent => { parent.childOrigin = '*'; return parent; });
  }
}
