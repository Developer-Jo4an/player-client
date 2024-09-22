export default class EventDispatcher {
  #list = new Map();

  addEventListener(type, listener) {
    return this.on(type, listener);
  }

  removeEventListener(type, listener) {
    return this.off(type, listener)
  }

  dispatchEvent(event) {
    return this.trigger(event);
  }

  on(type, listener) {
    if (!listener) return;
    const list = this.#list;
    if (!list.has(type)) {
      list.set(type, new Set);
    }
    const set = list.get(type);
    set.add(listener);
  }

  off(type, listener) {
    const list = this.#list;
    if (!list.has(type)) return;

    const set = list.get(type);
    set.delete(listener);
  }

  trigger(event) {
    if (typeof event === "string") event = {type: event};

    const list = this.#list;
    const set = list.get(event.type);
    if (!set) return false;

    for (const listener of set.values()) {
      listener(event);
    }
  }

  get listeners() {
    return this.#list.size;
  }

  destroy() {
    this.#list.clear();
    this.#list = undefined;
  }
}
