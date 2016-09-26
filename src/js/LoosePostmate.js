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

export default Postmate;
