export default function validateType(name, mimeType) {
  return types.has(name) && types.get(name).test(mimeType);
};

const mimes = new Map([
  ['javascript', /^(text|application)\/javascript$/i],
  ['json', /^(text|application)\/json$/i],
  ['markdown', /^text\/(x-)?markdown$/i],
  ['image', /^image\/.*$/i],
]);

const metas = [
  ['text', [
    mimes.get('javascript'),
    mimes.get('json'),
    mimes.get('markdown')
  ]],
  ['blob', [
    mimes.get('image')
  ]],
  ['config', [
    mimes.get('json')
  ]],
  ['*', [
    /.*/,
  ]],
  ['.source.js', [
    mimes.get('javascript'),
  ]],
  ['.source.gfm', [
    mimes.get('markdown'),
  ]]
].map(([key, regExps]) => [
  key,
  new RegExp(
    regExps.map((regExp) => regExp.source).join('|'), 'i'
  )
]);

const types = new Map([...mimes, ...metas]);
