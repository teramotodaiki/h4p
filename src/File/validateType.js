export default function validateType(name, mimeType) {
  return types.has(name) && types.get(name).test(mimeType);
};

const mimes = new Map([
  ['none', /^$/i],
  ['text', /^text\/plain$/i],
  ['html', /^text\/html$/i],
  ['css', /^text\/css$/i],
  ['javascript', /^(text|application)\/javascript$/i],
  ['json', /^(text|application)\/json$/i],
  ['markdown', /^text\/(x-)?markdown$/i],
  ['glsl', /^text\/(x-)?glsl/i],
  ['image', /^image\/.*$/i],
  ['audio', /^audio\/.*$/i],
]);

const metas = [
  ['text', [
    mimes.get('none'),
    mimes.get('text'),
    mimes.get('html'),
    mimes.get('css'),
    mimes.get('javascript'),
    mimes.get('json'),
    mimes.get('markdown')
  ]],
  ['blob', [
    mimes.get('image'),
    mimes.get('audio')
  ]],
  ['config', [
    mimes.get('json')
  ]],
  ['*', [
    /.*/,
  ]],
  ['.text.plane', [
    mimes.get('text'),
  ]],
  ['.text.html.basic', [
    mimes.get('html'),
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
