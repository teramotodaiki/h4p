import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/javascript-hint';


import Snippet from './Snippet';

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

  const snippets = Object.keys(jsSnippets)
    .filter((key) => key.indexOf(token.string) === 0)
    .map((key) => jsSnippets[key]);

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


const jsSnippets = {
  "(": new Snippet({
    text: "() => {};",
    displayText: '() => {}; [anonymous function]',
    pick: (from) => ({
      from: { line: from.line, ch: from.ch - 1 },
      to: { line: from.line, ch: from.ch + 1 },
    }),
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 6 },
      anchor: { line: from.line, ch: from.ch + 6 }
    }]
  }),
  "const": new Snippet({
    text: "const  = ;",
    displayText: '[const]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 6 },
      anchor: { line: from.line, ch: from.ch + 9 }
    }]
  }),
  "import": new Snippet({
    text: "import  from '';",
    displayText: '[import]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 7 },
      anchor: { line: from.line, ch: from.ch + 7 }
    }]
  }),
  "import*": new Snippet({
    text: "import * as  from '';",
    displayText: '[import *]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 12 },
      anchor: { line: from.line, ch: from.ch + 12 }
    }]
  }),
  "exportd": new Snippet({
    text: "export default ;",
    displayText: '[export default]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 15 },
      anchor: { line: from.line, ch: from.ch + 15 }
    }]
  }),
  "export": new Snippet({
    text: "export {  :  };",
    displayText: '[export { name: var }]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 9 },
      anchor: { line: from.line, ch: from.ch + 12 }
    }]
  }),
  "fetchblob": new Snippet({
    text: "fetch('')\n.then(response => response.blob())\n.then(blob => {\n\t\n});",
    displayText: 'fetch() [fetch:Blob]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 7 },
      anchor: { line: from.line, ch: from.ch + 7 }
    }],
    autoIndent: false,
  }),
  "fetchtext": new Snippet({
    text: "fetch('')\n.then(response => response.text())\n.then(text => {\n\t\n});",
    displayText: 'fetch() [fetch:Text]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 7 },
      anchor: { line: from.line, ch: from.ch + 7 }
    }],
    autoIndent: false,
  }),
  "f": new Snippet({
    text: "const  = () => {\n\t// \n};",
    displayText: '() => {}; [function]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 6 },
      anchor: { line: from.line, ch: from.ch + 6 }
    }]
  }),
  "fun": new Snippet({
    text: "function () {}",
    displayText: '[scoped anonymous function]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 13 },
      anchor: { line: from.line, ch: from.ch + 13 }
    }]
  }),
  "funcion": new Snippet({
    text: "function functionName() {\n\t// \n}",
    displayText: '[scoped function]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 9 },
      anchor: { line: from.line, ch: from.ch + 21 }
    }]
  }),
  "if": new Snippet({
    text: "if (true) {\n\t// \n}",
    displayText: '[if]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 4 },
      anchor: { line: from.line, ch: from.ch + 8 }
    }]
  }),
  "else": new Snippet({
    text: "else {\n\t// \n}",
    displayText: '[else]'
  }),
  "try": new Snippet({
    text: "try {} catch (e) {}",
    displayText: '[try-catch]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 5 },
      anchor: { line: from.line, ch: from.ch + 5 }
    }]
  }),
  "log": new Snippet({
    text: "console.log();",
    displayText: '[console.log]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 12 },
      anchor: { line: from.line, ch: from.ch + 12 }
    }]
  }),
  "error": new Snippet({
    text: "console.error();",
    displayText: '[console.error]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 14 },
      anchor: { line: from.line, ch: from.ch + 14 }
    }]
  }),
};

const endOfCompletion = /^(.*[\;\=\)\,]|\s*)$/;
