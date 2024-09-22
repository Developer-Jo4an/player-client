const storage = {};


export default class SequenceStorage {

  static _instance = null;

  static get instance() {
    if (!this._instance) this._instance = new SequenceStorage();
    return this._instance;
  }

  loadByName(data) {
    const imageData = storage[data.url];

    if (imageData) return Promise.resolve(imageData);

    return loadImage(data).then((imageData) => {
      storage[data.url] = imageData;
      return imageData;
    });
  }

}

export async function loadImage(data) {
  if (!global.Image) return Promise.resolve({});
  const {url, type, id} = data;
  const img = new Image();
  img.src = url;

  return new Promise(resolve => {
    img.onload = resolve;
  }).then(() => ({image: img, url, type, id}));
}
