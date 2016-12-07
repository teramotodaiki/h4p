import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/anyword-hint';

const anywordHint = CodeMirror.hint.anyword;

CodeMirror.hint.javascript = (instance, options) => {

  const cursor = instance.getCursor();
  const token = instance.getTokenAt(cursor);
  const from = { line: cursor.line, ch: token.start };
  const to = { line: cursor.line, ch: cursor.ch };
  const empty = { list: [], from, to };

  if (!/[A-Za-z\.\'\"\`]$/.test(token.string)) {
    return empty;
  }

  const result = anywordHint(instance, options) || empty;

  result.list = options.snippets
    .filter((snippet) => snippet.test(token.string))
    .concat(result.list);

  if (token.type === 'string') {
    const start = { line: cursor.line, ch: token.start + 1 };
    const prefix = instance.getLine(cursor.line)
      .substr(start.ch, cursor.ch - start.ch);

    result.list = getModuleNames(options.files, start, prefix)
      .concat(result.list);
  }

  return result;

};
function getModuleNames(files, from, prefix = '') {
  return files
    .filter(file => file.moduleName.indexOf(prefix) === 0)
    .map(file => ({ text: file.moduleName, from }));
}
