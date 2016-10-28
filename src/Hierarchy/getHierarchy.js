/**
 * @param items Array of files
 * @param path A string of current path like 'sub/' (default='')
 * @param An object has hierarchy
 */
export default function getHierarchy(items, path = '') {
  const files = [];
  const dirs = [];

  items
    .filter(item => item.name.indexOf(path) === 0)
    .forEach((item, i, all) => {
      const relativePath = item.name.replace(path, '');
      const slash = relativePath.indexOf('/');
      if (slash < 0) {
        // no slash
        files.push(item);
        return;
      }
      const subPath = path + relativePath.substr(0, slash + 1);
      if (dirs.every(dir => dir.path !== subPath)) {
        dirs.push(getHierarchy(all, subPath));
      }
    });

  return { files, dirs, path };
};
