export default (file, query, options = null) => {
  options = options || getOptions(query);

  if (options.showInvisibles === !!file.moduleName) {
    return false;
  }
  if (options.showTrashes !== file.options.isTrashed) {
    return false;
  }

  return query.split(/\s+/)
    .every((keyword) => {
      if (!keyword) {
        return true;
      }
      if (keyword[0] === ':') {
        return true;
      }

      return file.name.includes(keyword);
    });
};

export const getOptions = (query) => query.split(/\s+/)
  .reduce((p, keyword) => {
    return {
      showInvisibles: p.showInvisibles || keyword[0] === '.',
      showTrashes: p.showTrashes || keyword === ':trash',
    };
  }, {});
