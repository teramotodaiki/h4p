export default function validateType(name, mimeType) {
  return types.has(name) && types.get(name).test(mimeType);
};

const mimes = new Map([
  ['javascript', /^(text|application)\/javascript$/i],
  ['image', /^image\/.*$/i],
]);

const metas = new Map([
  ['text', [
    mimes.get('javascript')
  ]],
  ['blob', [
    mimes.get('image')
  ]],
])
.entries((key, regExps) => [
  key,
  new RegExp(
    regExps.map((regExp) => regExps.source).join('|'), 'i'
  )
]);

const types = new Map([...mimes, ...metas]);
