import CodeMirror, { Pos } from 'codemirror';
import 'codemirror/addon/hint/anyword-hint';

const anywordHint = CodeMirror.hint.anyword;

CodeMirror.hint.javascript = (instance, options) => {

  const { cursor, token, from, to, empty } = getTokenInfo(instance);

  if (!/[A-Za-z\.\'\"\`]$/.test(token.string)) {
    return empty;
  }

  const result = anywordHint(instance, options) || empty;

  result.list = options.snippets
    .filter((snippet) => startWith(snippet.prefix || snippet, token.string))
    .concat(result.list);

  if (token.type === 'string') {
    const start = { line: cursor.line, ch: token.start + 1 };
    const prefix = instance.getLine(cursor.line)
      .substr(start.ch, cursor.ch - start.ch);

    result.list = getCompleteNames(options.files, start, prefix)
      .concat(result.list);
  }

  return result;

};

const htmlHint = CodeMirror.hint.html;

CodeMirror.hint.html = (instance, options) => {

  const { cursor, token, from, to, empty } = getTokenInfo(instance);

  if (token.type === null) {
    return empty;
  }
  if (token.type === 'tag bracket' && token.string === '>') {
    return empty;
  }

  const result = htmlHint(instance, options) || empty;

  if (token.type === 'string') {
    const start = { line: cursor.line, ch: token.start + 1 };
    const prefix = instance.getLine(cursor.line)
      .substr(start.ch, cursor.ch - start.ch);

    result.list = getCompleteNames(options.files, start, prefix)
      .concat(result.list);
  }

  return result;

};

const cssHint = CodeMirror.hint.css;

CodeMirror.hint.css = (instance, options) => {

  const { cursor, token, from, to, empty } = getTokenInfo(instance);

  if (token.type === null) {
    return empty;
  }

  const result = cssHint(instance, options) || empty;

  if (token.type === 'string') {
    const start = new Pos(cursor.line, token.start);
    result.list = getCompleteNames(options.files, start, token.string)
      .concat(result.list);
  }

  return result;

};

CodeMirror.hint.markdown = (instance, options) => {

  const { cursor, token, from, to, empty } = getTokenInfo(instance);

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

  const result = empty;

  result.list = options.snippets
    .filter((snippet) => startWith(snippet.prefix, token.string))
    .concat(result.list);

  return result;

};

CodeMirror.hint.glsl = (instance, options) => {

    const { cursor, token, from, to, empty } = getTokenInfo(instance);

    if (token.type === null) {
      return empty;
    }

    return CodeMirror.hint.anyword(instance, options);

};


function getCompleteNames(files, from, prefix = '') {
  return files
    .filter(file => startWith(file.name, prefix))
    .map(file => ({ text: file.name, from }));
}

function startWith(text, needle) {
  return text.toLowerCase().indexOf(needle.toLowerCase()) === 0;
}

function getTokenInfo(instance) {

  const cursor = instance.getCursor();
  const token = instance.getTokenAt(cursor);
  const from = { line: cursor.line, ch: token.start };
  const to = { line: cursor.line, ch: cursor.ch };
  const empty = { list: [], from, to };

  return { cursor, token, from, to, empty };

}
