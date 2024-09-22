import Plugin from "./Plugin";

export default class ButtonPlugin extends Plugin {

  name = "button";

  attach(target) {
    this.detach(target);
    this.target = target;
    target.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("touchstart", this.onKeyDown);
      button.addEventListener("touchend", this.onKeyUp);
      button.addEventListener("mousedown", this.onMouseDown);
      button.addEventListener("mouseup", this.onMouseUp);
    });
  }

  detach(target) {
    target.querySelectorAll("[data-action]").forEach(button => {
      button.removeEventListener("touchstart", this.onKeyDown);
      button.removeEventListener("touchend", this.onKeyUp);
      button.removeEventListener("mousedown", this.onMouseDown);
      button.removeEventListener("mouseup", this.onMouseUp);
    });
    this.target = null;
  }

  onKeyDown = (event) => {
    const actionName = event.target.dataset.action;
    this.triggerAction(actionName, true);
  };

  onKeyUp = (event) => {
    const actionName = event.target.dataset.action;
    this.triggerAction(actionName, false);
  };

  onMouseDown = (event) => {
    const actionName = event.target.dataset.action;
    this.triggerAction(actionName, true);
  };

  onMouseUp = (event) => {
    const actionName = event.target.dataset.action;
    this.triggerAction(actionName, false);
  };

  triggerAction(actionName, active) {
    this._actions.forEach(action => {
      if (action.data.name === actionName) {
        action.active = active;
        action.refresh();
      }
    });
  }
}
