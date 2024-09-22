export default class Bridge {

  static _instance = null;

  static get instance() {
    if (!this._instance) this._instance = new Bridge();

    return this._instance;
  }

  reducer = {};

  constructor() {
    this.onMessage = this.onMessage.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  init(reducer = {}) {
    global.addEventListener("message", this.onMessage);

    this.reducer = reducer;

    this.send(this.readyEvent);

    return this.unsubscribe;
  }

  getEventType(event) {
    return "unknownEvent"
  }

  unsubscribe() {
    global.removeEventListener("message", this.onMessage);
  }

  onMessage(event) {
    const type = this.getEventType(event);

    if (typeof this.reducer[type] == "function")
      this.reducer[type](event);
  }

  get readyEvent() {
    return "ready";
  }

  send(message) {
    const parent = global.opener || global.parent;
    if (parent !== global.window) {
      parent.postMessage(message, "*");
      console.log(">>", message);
    }
  }
}
