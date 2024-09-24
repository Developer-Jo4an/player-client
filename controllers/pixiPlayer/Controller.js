import {inputController} from "./InputController";
import {fromHex} from "../../utils/helpers";
import EdgesHelper from "./helpers/EdgesHelper";

class Controller {

  controllers = {
    input: inputController
  };

  helpersList = {
    edges: EdgesHelper
  };

  constructor({container, eventBus, file, activeLabel, active, helpersColor, isHelpers, color}) {
    this.onResize = this.onResize.bind(this);
    this.update = this.update.bind(this);

    this.container = container;
    this.eventBus = eventBus;

    this.lib = file.lib;

    this.framerate = file.framerate;
    this.totalFrames = file.totalFrames;

    this.active = active;

    this.isHelpers = isHelpers;
    this.helpers = {};

    this.activeLabel = activeLabel;
    this.activeLabelEndFrame = null;

    this.isPaused = false;

    this.color = color;
    this.helpersColor = helpersColor;

    this.initApplication();
    this.onResize();
  }

  initApplication() {
    this.app = new PIXI.Application({
      resolution: 1,
      autoResize: true,
      antialias: true,
      backgroundColor: fromHex(this.color)
    });
    globalThis.__PIXI_APP__ = this.app;
    this.initHelpers();
    this.container.append(this.app.view);
    window.addEventListener("resize", this.onResize);
    this.app.ticker.add(this.update);
  }

  update() {
    this.active && this.isHelpers && this.setHelpers();
    if (!this.activeLabelEndFrame || this.isPaused) return;
    if (this.active.currentFrame >= this.activeLabelEndFrame)
      this.active.gotoAndPlay(this.activeLabel);
  }

  initHelpers() {
    for (const key in this.helpersList) {
      const HelperClass = this.helpersList[key];
      this.helpers[key] = new HelperClass(this.app);
    }
  }

  setActive(payload) {
    this.active && this.active.destroy({children: true});

    const {width, height} = this.app.renderer;

    this.active = new this.lib[payload]();
    this.active.name = payload;
    const bounds = this.active.getBounds();
    this.active.pivot.set(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    this.active.position.set(width / 2, height / 2);
    const scaleX = width / bounds.width * 0.5;
    const scaleY = height / bounds.height * 0.5;
    const scale = Math.min(scaleX, scaleY);
    this.active.scale.set(scale);
    this.active.isHelp = true;
    this.app.stage.addChild(this.active);

    this.setActiveLabel(null);

    this.setControllers();

    this.isPaused && this.setIsPaused();

    !this.isHelpers && this.setIsHelpers();

    this.eventBus.dispatchEvent({type: "item:set-active", payload: this.active});
  }

  setIsPaused() {
    this.isPaused = !this.isPaused;
    this.active?.[this.isPaused ? "stop" : "gotoAndPlay"]?.(this.active.currentFrame);
    this.eventBus.dispatchEvent({type: "item:set-isPaused", payload: this.isPaused});
  }

  setIsHelpers() {
    this.isHelpers = !this.isHelpers;
    this[!this.isHelpers ? "killHelpers" : "setHelpers"]();
    this.eventBus.dispatchEvent({type: "item:set-isHelpers", payload: this.isHelpers});
  }

  setColor(payload) {
    this.color = fromHex(payload);
    this.app.renderer.backgroundColor = this.color;
    this.eventBus.dispatchEvent({type: "item:set-color", payload});
  }

  setHelpersColor(payload) {
    this.helpersColor = payload;
    this.eventBus.dispatchEvent({type: "item:set-helpersColor", payload});
  }

  setActiveLabel(payload) {
    this.activeLabel = this.activeLabel === payload ? null : payload;
    if (this.activeLabel) {
      const necessaryIndex = this.active.labels.findIndex(({label}) => this.activeLabel === label) + 1;
      this.activeLabelEndFrame = (this.active.labels[necessaryIndex]?.position ?? this.active.totalFrames) - 1;
    } else {
      this.activeLabelEndFrame = null;
    }
    this.eventBus.dispatchEvent({type: "item:set-activeLabel", payload: this.activeLabel});
  }

  killHelpers() {
    for (const key in this.helpers) {
      const helper = this.helpers[key];
      helper?.killHelper?.();
    }
  }

  setHelpers() {
    if (!this.active) return;
    for (const key in this.helpers) {
      const helper = this.helpers[key];
      helper?.updateHelper?.({mainColor: fromHex(this.helpersColor)});
    }
  }

  setControllers() {
    const {eventBus, app, active, container} = this;
    for (const key in this.controllers) {
      const controller = this.controllers[key];
      controller?.init?.({eventBus, app, element: active, container});
    }
  }

  onResize() {
    const {offsetWidth, offsetHeight} = this.container;
    for (const key in this.controllers) this.controllers[key].resize();
    this.app.renderer.resize(offsetWidth, offsetHeight);
  }

  reset() {
    window.removeEventListener("resize", this.onResize);
    for (const key in this.controllers) this.controllers[key].reset();
    this.app.destroy(true);
    this.app = null;
  }
}

export default Controller;
