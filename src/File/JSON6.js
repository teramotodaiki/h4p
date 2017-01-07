// JSON and ES6 Template Literals

export function parse(text) {

  const escapeTL = (text) =>
    text
      .replace(/^\n/, '')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      .replace(/\'/g, '\'')
      .replace(/\"/g, '\\"');

  text =
    text.split('`')
    .map((seg, i) => i % 2 === 1 ? escapeTL(seg) : seg)
    .join('\"');

  return JSON.parse(text);

};
