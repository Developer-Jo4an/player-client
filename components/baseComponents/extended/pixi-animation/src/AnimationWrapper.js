import PixiWrapper from "../../../utils/scene/wrappers/pixi/PixiWrapper";
import AnimationController from "./AnimationController";

const {PIXI} = global;

export default class AnimationWrapper extends PixiWrapper {

  static _instances = {};

  static cache = {};

  static cacheObject(object, name) {
    if (!this.cache[name]) this.cache[name] = [];

    this.cache[name].push(object);
  }

  static fromCache(name) {
    if (this.cache[name]?.length)
      return this.cache[name].splice(0, 1)[0];
  }

  static getInstance(uuid) {
    if (!this._instances[uuid])
      this.createInstance(uuid);

    return this._instances[uuid];
  }

  static postprocessing = {}

  static createInstance(uuid) {
    this._instances[uuid] = new AnimationWrapper();
  }

  constructor() {
    super();

    this.init();
  }

  initController() {
    const {eventBus, storage} = this;

    return new AnimationController({
      eventBus, storage, applicationSettings: {
        transparent: true,
        backgroundColor: undefined
      }
    });
  }

  clear() {
    this.stage.children.forEach((child) => {
      if (child.isMoveToCache)
        AnimationWrapper.cacheObject(child, child.name);
    });

    this.stage.removeChildren();
  }

  unload(uuid) {
    if (this._uuid !== uuid) return;

    this.app.ticker.stop();
    this.clear();
  }

  updateData({container, data, settings: {size, children}, onInit, uuid}) {
    this.app.ticker.start();

    this.clear();

    this._uuid = uuid;

    this.initChildren(children, data);

    this.controller.size = size;

    this.appendContainer(container);

    onInit?.call(null,
      {
        controller: this,
        PIXI: PIXI,
      }
    )
  }

  initChildren(children, data) {
    children.forEach(childData => {
      const {type} = childData;
      const creator = this[`init${type.charAt(0).toUpperCase()}${type.slice(1)}`]
      if (typeof creator === "function")
        creator.call(this, childData, data);
    })
  }

  initAnimation({
                  animationContainer,
                  postprocessing,
                  label,
                  frame,
                  type,
                  clip: clipName,
                  transform,
                  useCache = true
                }, data) {
    const animationData = global.window[animationContainer];
    const clip = useCache && AnimationWrapper.fromCache(clipName) || new animationData.lib[clipName];
    clip.name = clipName;

    if (postprocessing && AnimationWrapper.postprocessing[postprocessing])
      AnimationWrapper.postprocessing[postprocessing](clip, data);

    if (label)
      PIXI.animate.Animator.play(clip, label, () => this.stage.emit("animation-controller:animation-end"));
    else if (frame !== undefined) clip.gotoAndStop(frame);

    clip.isMoveToCache = true;

    this.applyTransform(clip, transform);

    this.stage.addChild(clip);
  }

  get stage() {
    return this.controller.stage;
  }

  get app() {
    return this.controller.app;
  }

  applyTransform(clip, transform) {
    if (!transform) return;

    ["rotation"].forEach(prop => {
      clip[prop] = transform[prop] ?? 0;
    });
    ["position", "scale"].forEach(prop => {
      clip[prop].copyFrom(transform[prop] ?? {x: 0, y: 0, z: 0});
    })
  }

}
