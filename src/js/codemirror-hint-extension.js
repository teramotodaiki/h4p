import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/javascript-hint';


import Snippet from './Snippet';

const jsHint = CodeMirror.hint.javascript;
CodeMirror.hint.javascript = (instance, options) => {
  const token = instance.getTokenAt(instance.getCursor());

  options = Object.assign({}, options, jsOptions);

  const result = jsHint(instance, options) || { list: [], from: token.from, to: token.to };

  const snippets = Object.keys(jsSnippets)
    .filter((key) => key.indexOf(token.string) === 0)
    .map((key) => jsSnippets[key]);

  result.list = snippets.concat(result.list);

  return result;
};


const jsOptions = {
  globalScope: {
    require: {},
    exports: {},
    module: { exports: {} },
    console: { log: {}, info: {}, warn: {}, error: {}, time: {}, timeEnd: {} },
  }
};


const jsSnippets = {
  "fun": new Snippet({
    text: "function functionName() {\n\t// \n}",
    displayText: '[function]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 9 },
      anchor: { line: from.line, ch: from.ch + 21 }
    }]
  }),
  "f": new Snippet({
    text: "function () {}",
    displayText: '[anonymous function]',
    selections: (from) => [{
      head: { line: from.line, ch: from.ch + 13 },
      anchor: { line: from.line, ch: from.ch + 13 }
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
  })
};
