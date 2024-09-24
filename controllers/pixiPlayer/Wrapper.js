import Controller from "./Controller";
import {EventDispatcher} from "../../utils/scene/events/EventDispatcher";

let instance = null;

export default class Wrapper {

  constructor(container) {
    instance && instance.reset();
    instance = this;

    this.container = container.current;
    this.eventBus = new EventDispatcher();
  }

  getLib() {
    return this.controller && this.controller.lib;
  }

  setActive(key) {
    this.controller && this.controller.setActive(key);
  }

  setIsHelpers() {
    this.controller && this.controller.setIsHelpers();
  }

  setIsPaused() {
    this.controller && this.controller.setIsPaused();
  }

  setColor(payload) {
    this.controller && this.controller.setColor(payload);
  }

  setHelpersColor(payload) {
    this.controller && this.controller.setHelpersColor(payload);
  }

  reset() {
    this.controller && this.controller.reset();
  }

  initController(state) {
    const {eventBus, container} = this;
    this.controller = new Controller({...state, container, eventBus});
  }
}
