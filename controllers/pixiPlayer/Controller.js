import {inputController} from "./InputController";

class Controller {

  controllers = {
    input: inputController
  };

  constructor({container, lib, framerate, totalFrames, eventBus}) {
    this.onResize = this.onResize.bind(this);
    this.update = this.update.bind(this);

    this.container = container;
    this.eventBus = eventBus;
    this.lib = lib;

    this.framerate = framerate;
    this.totalFrames = totalFrames;

    this.active = null;

    this.isHelpers = true;
    this.helpers = {};

    this.isPaused = false;

    this.initApplication();
    this.onResize();
  }

  initApplication() {
    this.app = new PIXI.Application({
      resolution: 1,
      autoResize: true,
      antialias: true,
      backgroundColor: 0x000000
    });
    globalThis.__PIXI_APP__ = this.app;
    this.container.append(this.app.view);
    window.addEventListener("resize", this.onResize);
    this.app.ticker.add(this.update);
  }

  update() {
    this.active && this.isHelpers && this.setHelpers();
  }

  setActive(payload) {
    this.setSettings(payload);
    this.isPaused && this.setIsPaused();
    !this.isHelpers && this.setIsHelpers();
    this.setInput();
    this.eventBus.dispatchEvent({type: "item:set-active", payload: this.active});
  }

  setIsPaused() {
    this.isPaused = !this.isPaused;
    this.active?.[this.isPaused ? "stop" : "gotoAndPlay"]?.(this.active.currentFrame);
    this.app.ticker?.[this.isPaused ? "stop" : "start"]?.();
    this.eventBus.dispatchEvent({type: "item:set-isPaused", payload: this.isPaused});
  }

  setIsHelpers() {
    this.isHelpers = !this.isHelpers;
    this[!this.isHelpers ? "killHelpers" : "setHelpers"]();
    this.eventBus.dispatchEvent({type: "item:set-isHelpers", payload: this.isHelpers});
    this.app.render();
  }

  setSettings(payload) {
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

    this.app.stage.addChild(this.active);
  }

  killHelpers() {
    Object.values(this.helpers).forEach(helper => !helper.destroyed && helper.destroy());
    this.helpers = {};
  }

  setHelpers() {
    this.killHelpers();

    const {x, y, width, height} = this.active.getBounds();

    const border = this.helpers.border = new PIXI.Graphics();
    border.lineStyle(2, 0xff0000).drawRect(x, y, width, height);

    const pivot = this.helpers.pivot = new PIXI.Graphics();
    pivot.lineStyle(2, 0xff0000).beginFill(0xff0000, 1).drawCircle(x + width / 2, y + height / 2, 2);

    this.app.stage.addChild(border);
    this.app.stage.addChild(pivot);
  }

  setInput() {
    this.controllers.input.init(this.eventBus, this.app, this.active, this.container);
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
