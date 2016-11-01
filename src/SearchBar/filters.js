
export const allVisibleFiles = () => (file) => !!file.moduleName;

export const search = (value) => concat(
  allVisibleFiles(),
  (file) => file.name.includes(value)
);


function concat (...predicades) {
  return (file) => predicades.every(pred => pred(file));
}
