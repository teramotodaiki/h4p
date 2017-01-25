export default function (url) {

  if (typeof URL === 'function') {
    return new URL(url).origin;
  }

  // for IE11
  const a = document.createElement('a');
  a.href = url;
  return a.origin;

}
