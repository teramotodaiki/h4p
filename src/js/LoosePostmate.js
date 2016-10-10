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
    const { url, model, frame } = userOptions;

    _this.parent = window;
    _this.frame = frame;
    _this.child = _this.frame.contentWindow || frame;
    _this.model = model || {};

    const handshake = Postmate.prototype.sendHandshake.call(_this, url);

    const handleLoad = () => {
      _this.child.postMessage({
        postmate: 'handshake',
        type: MESSAGE_TYPE,
        model: _this.model,
      }, '*');
    };

    if (_this.child.document.readyState === 'complete') {
      handleLoad();
    } else {
      frame.onload = handleLoad;
    }

    return handshake.then(parent => {
       parent.childOrigin = '*';
       parent.destroy = function () {
          if (this.frame && this.frame.parentNode) {
            // iframe
            this.frame.src = '';
          } else if (typeof this.frame.close === 'function') {
            // window.open (external window)
            this.frame.close();
          }
          window.removeEventListener('message', this.listener, false);
       };
       return parent;
     })
     .catch((err) => console.error(err));
  }
}
