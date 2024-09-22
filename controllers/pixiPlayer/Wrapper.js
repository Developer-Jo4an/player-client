import Controller from "./Controller";
import {EventDispatcher} from "../../utils/scene/events/EventDispatcher";

let instance = null;

export default class Wrapper {

  constructor(state, container) {
    instance && instance.reset();
    instance = this;

    this.framerate = state.file.framerate;
    this.lib = state.file.lib;
    this.totalFrames = state.file.totalFrames;
    this.container = container.current;
    this.eventBus = new EventDispatcher();
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

  reset() {
    this.controller.reset();
  }

  initController() {
    const {container, lib, framerate, totalFrames, eventBus} = this;
    this.controller = new Controller({container, lib, framerate, totalFrames, eventBus});
  }
}
