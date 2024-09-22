/* eslint max-classes-per-file: "off" */

export class PaintHistoryItem extends Array{
  params;

  path;

  constructor(params) {
    super();
    this.params = params;
  }

  draw(pnt) {
    this.push(pnt);
  }

  get lastPoint() {
    return this[this.length - 1];
  }

  setPath(path) {
    this.path = path;
  }
}

export class PaintHistory extends Array {
  #index = 0;

  add(params) {
    const itm = new PaintHistoryItem(params);

    // eslint-disable-next-line no-plusplus
    this.splice(this.#index++);
    this.push(itm);
    return itm;
  }

  undo() {
    this.#index = Math.max(0, this.#index - 1);
    return this[this.#index - 1];
  }

  redo() {
    this.#index = Math.min(this.length, this.#index + 1);
    return this[this.#index - 1];
  }

  reset() {
    this.#index = 0;
    this.length = 0;
  }

  get() {
    return this.slice(0, this.#index);
  }
}
