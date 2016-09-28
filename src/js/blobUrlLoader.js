const loader = (options, base64) => (
`module.exports = (function (options, base64) {
  var bin = atob(base64);
  var byteArray = new Uint8Array(bin.length);
  for (var i = bin.length - 1; i >= 0; i--) {
    byteArray[i] = bin.charCodeAt(i);
  }
  var blob = new Blob([byteArray.buffer], options);
  return URL.createObjectURL(blob);
})(${JSON.stringify(options)}, "${base64}");
`);

export default (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const { result } = event.target;
      const { type } = file;
      const base64 = result.substr(result.indexOf(',') + 1);
      resolve(loader({ type }, base64));
    };
    reader.readAsDataURL(file);
  });
