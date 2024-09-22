import Plugin from "./Plugin";
import Key from "./Key";

export default class KeyboardPlugin extends Plugin {

  name = "keyboard";

  _keys = {};

  checkAction(action) {
    return !!action.data.keyboard;
  }

  addAction(action) {
    super.addAction(action);
  }

  attach(target) {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);

    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
  }

  detach(target) {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);
  }

  getKey(code) {
    if (!this._keys[code])
      this._keys[code] = new Key({code});

    return this._keys[code];
  }

  onKeyDown = ({keyCode}) => {
    const key = this.getKey(keyCode);
    if (key.pressed) return;
    key.pressed = true;

    this.checkActions();
  };

  onKeyUp = ({keyCode}) => {
    const key = this.getKey(keyCode);
    if (!key.pressed) return;
    key.pressed = false;

    this.checkActions();
    this.checkPressed();
  };

  checkPressed() {
    const pressed = this.pressedKeys;

    this._actions.forEach(action => {
      const {data: {keyboard: {keys}}} = action;

      if (keys.find(({keyCode}) => pressed.includes(keyCode)))
        action.refresh();
    })
  }

  updateAction(action) {
    const {data: {keyboard: {keys}}} = action;
    action.active = keys.some(({keyCode}) => this._keys?.[keyCode]?.pressed);
  }

  get pressedKeys() {
    return Object.values(this._keys).filter(key => key.pressed).map(({code}) => code);
  }

}
