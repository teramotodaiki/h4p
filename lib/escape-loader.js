module.exports = function(content) {
  this.cacheable && this.cacheable();
  this.value = content;

  const reg = /[ª-ￜ]/g;
  content = content.replace(reg, function (s) {
    return escape(s).replace('%', '\\');
  });
  return content;
};
