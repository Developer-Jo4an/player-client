import Bridge from "./Bridge";

export default class CustomBridge extends Bridge {

  static _instance = null;

  static get instance() {
    if (!this._instance) this._instance = new CustomBridge();

    return this._instance;
  }

  getEventType(event) {
    if (event?.data?.type === "auth")
      return "authorization";

    return "unknownEvent"
  }
}
