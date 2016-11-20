const babelStandaloneJs = require('raw!./escape-loader!babel-standalone/babel.min');


module.exports = [
  babelStandaloneJs,
  funcToStr(workerFunc),
].join('\n');

function workerFunc() {
  self.addEventListener('message', function (event) {
    const code = Babel.transform(
      event.data.code,
      event.data.babelrc
    ).code;

    self.postMessage({
      id: event.data.id,
      code: code,
    });
  });
}

function funcToStr(func) {
  return func.toString().trim().match(
    /^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/
  )[1];
}
