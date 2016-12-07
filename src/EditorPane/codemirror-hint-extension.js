import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/anyword-hint';

const anywordHint = CodeMirror.hint.anyword;

CodeMirror.hint.javascript = (instance, options) => {

  const cursor = instance.getCursor();
  const token = instance.getTokenAt(cursor);
  const from = { line: cursor.line, ch: token.start };
  const to = { line: cursor.line, ch: cursor.ch };
  const empty = { list: [], from, to };

  if (!/[A-Za-z\.]$/.test(token.string)) {
    return empty;
  }

  const result = anywordHint(instance, options) || empty;

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
