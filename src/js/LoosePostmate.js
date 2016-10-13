import Postmate from 'postmate';

const MESSAGE_TYPE = 'application/x-postmate-v1+json';


// Un-checked origin
window.addEventListener('message', (event) => {
  if (event.data.type === MESSAGE_TYPE && event.source !== window) {
    window.postMessage(event.data, '/');
    event.preventDefault();
  }
}, true);

// Postmateのconstructorを再現し、this.frame.onloadをoverrideする
export default class _Postmate {
  constructor(userOptions) {
    // superをコールするとthisがsendHandshakeの戻り値になるため、コールしない
    const _this = {};

    // base constructor
    const { url, model, frame } = userOptions;

    _this.parent = window;
    _this.frame = frame;
    _this.child = _this.frame.contentWindow;
    _this.model = model || {};

    const handshake = Postmate.prototype.sendHandshake.call(_this, url);

    frame.onload = () => {
      _this.child.postMessage({
        postmate: 'handshake',
        type: MESSAGE_TYPE,
        model: _this.model,
      }, '*');
    };

    return handshake.then(parent => {
       parent.childOrigin = '*';
       parent.destroy = function () {
          window.removeEventListener('message', this.listener, false);
       };
       return parent;
     })
     .catch((err) => console.error(err));
  }
}
