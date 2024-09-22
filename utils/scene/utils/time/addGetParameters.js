export function addGetParameters(parameters, url) {
  if (!url) url = window.location.href;
  const urlObject = new URL(url);
  Object.entries(parameters).forEach(([key, value]) => {
    urlObject.searchParams.set(key, value);
  });
  return urlObject.toString();
}
