const cache = {};

export default function loadImage(url) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  if (!cache[url]) {
    cache[url] = {
      img,
      promise: new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("message"));
        img.src = url;
      })
    };
  }
  return cache[url];
}
