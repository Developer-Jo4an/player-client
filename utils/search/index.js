export function getSearch() {
  const res = {};
  if (global.location) {
    const map = new URLSearchParams(global.location.search);
    for (const [key, value] of map.entries()) {
      res[key] = decodeURIComponent(value);
    }
  }
  return res;
}
