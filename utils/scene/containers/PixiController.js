import SceneController from "./SceneController";
import Loader from "../loader/Loader";
import {pixiManager} from "../loader/plugins/pixi/PixiManager";
import {howlerManager} from "../loader/plugins/howler/HowlerManager";
import {Stage} from "@pixi/layers";

Loader.registerManager(pixiManager, "pixijs");
Loader.registerManager(howlerManager, "howler");

export default class PixiController extends SceneController {

  contexts = []

  constructor(data) {
    super(data);

    this.applicationSettings = data.applicationSettings ?? {};

    this.onResize = this.onResize.bind(this);
  }

  loadingSelect() {
    return Loader.load(this.storage.preload, {
      onLoad: this.onLoad,
      externalData: {
        stage: this.stage
      }
    });
  }

  onResize({width, height}) {
    const {renderer} = this;
    renderer.resize(width, height);
  }

  get renderer() {
    return this.app?.renderer;
  }

  get canvas() {
    return this.app?.renderer?.view;
  }

  get stage() {
    return this.app.stage;
  }

  appendContainer(container) {
    this.renderer && container.appendChild(this.canvas);
    super.appendContainer(container);
  }

  init() {
    super.init();

    this.initApplication();

    if (this.container)
      this.appendContainer(this.container);
  }

  initApplication() {
    const {applicationSettings} = this;
    this.app = new PIXI.Application(
      Object.assign(
        {
          transparent: true,
          resolution: window.devicePixelRatio,
          autoResize: true,
          antialias: true
        },
        applicationSettings
      )
    );
    this.app.stage = new Stage();
    globalThis.__PIXI_APP__ = this.app;
    this.destroyHandler();
  }

  createPixiContext(count) {
    const {applicationSettings} = this;
    if (this.contexts.length >= count) return

    const app = new PIXI.Application(
      Object.assign(
        {
          transparent: true,
          resolution: window.devicePixelRatio,
          autoResize: true,
          antialias: true
        },
        applicationSettings
      )
    );
    this.contexts.push(app);
    console.log("Кол-во контекстов:", this.contexts.length)
  }

  loseContext() {
    const loseContextExt = this.renderer.gl.getExtension('WEBGL_lose_context');
    if (loseContextExt) {
      console.log('Симуляция потери контекста');
      loseContextExt.loseContext();
    }
  }

  createWebGLContext(count){
    if (this.contexts.length >= count) return

    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    this.contexts.push(gl);
    console.log("Кол-во контекстов:", this.contexts.length)
  }


  destroyHandler() {
    this.app.view.addEventListener("webglcontextlost", function (e) {
      this.eventBus.dispatchEvent({type: "app:destroy", e});
    }.bind(this));
    //this.app.view.addEventListener("webglcontextlost", () => console.log("webglcontextlost"));
  }
}
