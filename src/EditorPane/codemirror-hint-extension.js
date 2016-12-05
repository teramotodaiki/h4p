import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/javascript-hint';


const jsHint = CodeMirror.hint.javascript;
CodeMirror.hint.javascript = (instance, options) => {
  const cursor = instance.getCursor();
  const token = instance.getTokenAt(cursor);
  const from = { line: cursor.line, ch: token.start };
  const to = { line: cursor.line, ch: cursor.ch };

  if (endOfCompletion.test(token.string)) {
    return { list: [], from, to };
  }

  if (token.type === null && token.string !== '(') {
    return { list: [], from, to };
  }

  options = Object.assign({}, options, jsOptions);

  const result = jsHint(instance, options) || { list: [], from, to };

  const snippets = options.snippets['.source.js']
    .filter((snippet) => snippet.test(token.string));

  result.list = snippets.concat(result.list);

  if (token.type === 'string') {
    const left = instance.getLine(cursor.line)
      .substr(0, cursor.ch)
      .substr(token.start + 1);
    const moduleNames = options.files
      .filter(file => file.moduleName.indexOf(left) === 0)
      .map(file => ({
        text: file.moduleName,
        from: { line: from.line, ch: from.ch + 1 },
      }));
    result.list = moduleNames.concat(result.list);
  }

  return result;
};

const globalScope = (keys => {
  const merge = (p, c) => {
    if (typeof c === 'string') {
      p[c] = null;
      return p;
    } else if (c instanceof Array) {
      const key = c[0];
      const props = c.slice(1);
      p[key] = props.reduce(merge, Object.create(null));
    }
    return p;
  };
  return keys.reduce(merge, Object.create(null));
})([
  'require',
  'exports',
  ['module', 'exports'],
  ['console', 'log', 'info', 'warn', 'error', 'time', 'timeEnd'],
  ['env', 'DEBUG', 'VIEW']
]);

const jsOptions = {
  globalScope
};

const endOfCompletion = /^(.*[\;\=\)\,]|\s*)$/;
