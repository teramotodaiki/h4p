
export const allVisibleFiles = () => (file) => !!file.moduleName;

export const search = (value) => {
  if (value.indexOf('.') === 0) {
    return (file) => file.name.indexOf(value) === 0;
  }
  return concat(
    allVisibleFiles(),
    (file) => file.name.includes(value)
  );
};



function concat (...predicades) {
  return (file) => predicades.every(pred => pred(file));
}
