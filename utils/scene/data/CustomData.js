/* eslint-disable */

export class CustomData {

  sceneData = {};

  set data(data) {
    this._data = data;

    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        }
      });
    })
  }


}

const storage = new CustomData();
export default storage;
