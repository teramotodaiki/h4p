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
    .filter((snippet) => startWith(snippet.prefix, token.string))
    .concat(result.list);

  if (token.type === 'string') {
    const start = { line: cursor.line, ch: token.start + 1 };
    const prefix = instance.getLine(cursor.line)
      .substr(start.ch, cursor.ch - start.ch);

    result.list = getCompleteNames(options.files, start, prefix)
      .concat(result.list);
  }

  result.list = options.completes
    .filter((complete) => startWith(complete, token.string))
    .concat(result.list);

  return result;

};

CodeMirror.hint.markdown = (instance, options) => {

  const cursor = instance.getCursor();
  const token = instance.getTokenAt(cursor);
  const from = { line: cursor.line, ch: token.start };
  const to = { line: cursor.line, ch: cursor.ch };
  const empty = { list: [], from, to };

  if (token.type === 'string url') {
    const start = {
      line: cursor.line,
      ch: token.string[0] === '(' ? token.start + 1 : token.start
    };
    const prefix = instance.getLine(cursor.line)
      .substr(start.ch, cursor.ch - start.ch);
    return {
      list: getCompleteNames(options.files, start, prefix),
      from, to
    };
  }

  if (!/[A-Za-z\.\'\"\`\(\[]$/.test(token.string)) {
    return empty;
  }

  const result = anywordHint(instance, options) || empty;

  result.list = options.snippets
    .filter((snippet) => startWith(snippet.prefix, token.string))
    .concat(result.list);

  return result;

};


function getCompleteNames(files, from, prefix = '') {
  return files
    .filter(file => startWith(file.name, prefix))
    .map(file => ({ text: file.name, from }));
}

function startWith(text, needle) {
  return text.toLowerCase().indexOf(needle.toLowerCase()) === 0;
}
