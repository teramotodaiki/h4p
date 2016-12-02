export default function validateType(name, mimeType) {
  return types.has(name) && types.get(name).test(mimeType);
};

const mimes = new Map([
  ['javascript', /^(text|application)\/javascript$/i],
  ['image', /^image\/.*$/i],
]);

const metas = [
  ['text', [
    mimes.get('javascript')
  ]],
  ['blob', [
    mimes.get('image')
  ]],
].map(([key, regExps]) => [
  key,
  new RegExp(
    regExps.map((regExp) => regExp.source).join('|'), 'i'
  )
]);

const types = new Map([...mimes, ...metas]);
