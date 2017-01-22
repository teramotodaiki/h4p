export default function uniqueBy(array, key) {
  const map = new Map();

  for (const item of array) {
    map.set(item[key], item);
  }

  const values = Array.from(map.values());
  map.clear();

  return values;
}
