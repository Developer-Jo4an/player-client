import Plugin from "./Plugin";

export default class TouchSegmentPlugin extends Plugin {

  name = "touchSegment";

  _touches = {};

  checkAction(action) {
    return !!action.data.touch;
  }

  addAction(action) {
    super.addAction(action);
  }

  attach(target) {
    this.detach(target);
    this.target = target;
    target.addEventListener("touchstart", this.onKeyDown);
    target.addEventListener("touchend", this.onKeyUp);
    target.addEventListener("touchcancel", this.onKeyUp);
  }

  detach(target) {
    this.target = null;
    target.removeEventListener("touchstart", this.onKeyDown);
    target.removeEventListener("touchend", this.onKeyUp);
    target.removeEventListener("touchcancel", this.onKeyUp);
  }

  onKeyDown = ({changedTouches}) => {
    const touch = changedTouches[0];
    this._touches[touch.identifier] = touch;
    this.checkActions();
  };

  onKeyUp = ({changedTouches}) => {
    Object.values(changedTouches).forEach(touch => {
      delete this._touches[touch.identifier];
    });
    this.checkActions();
  };

  checkActions() {
    if (Object.values(this._touches).length) {
      Object.values(this._touches).forEach(touchData => {
        this._actions.forEach(action => this.updateAction(action, touchData));
      });
    } else this._actions.forEach(action => this.updateAction(action, null));
  }

  updateAction(action, touchData) {
    let active = false;
    if (touchData) {
      const {globalX, clientX} = touchData;
      const {data: {touchSegment: {segmentX}}} = action;
      const {target} = this;

      const isTargetWindow = target === global.window;

      const width = isTargetWindow ? target.innerWidth : target.clientWidth;
      const x = isTargetWindow ? clientX : globalX;

      const left = segmentX[0] * width;
      const right = segmentX[1] * width;

      active = x >= left && x <= right;
    }

    if (active)
      this.resetActionsActive();

    action.active = active;
  }


  resetActionsActive() {
    this._actions.forEach(action => action.active = false);
  }
}
