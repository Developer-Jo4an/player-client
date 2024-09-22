export function pathToNameAndPath(path) {
  const array = path.split('/');
  const name = array[array.length - 1].split('.')[0];
  return {name: name, path: path};
}
