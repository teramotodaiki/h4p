export default function separate(fullpath) {
  // Filename CAN'T contains spaces.
  fullpath = fullpath.replace(/\s/g, '');
  // Path separator
  fullpath = fullpath.replace(/:/g, '/');

  const pathLength = fullpath.lastIndexOf('/') + 1;
  const path = fullpath.substr(0, pathLength);
  const filename = fullpath.substr(pathLength);

  const planeLength = filename.includes('.') ?
    filename.lastIndexOf('.') : filename.length;
  const plane = filename.substr(0, planeLength);
  const ext = filename.substr(planeLength);

  const name = path + plane + ext;
  const moduleName = path + plane;

  return { path, plane, ext, name, moduleName };
}
