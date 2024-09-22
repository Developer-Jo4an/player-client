import BaseLoader from "../BaseLoader";

/**
 *   {
 *     "subtype": "pixijs",
 *     "type": "scene",
 *     "name": "some_scene", - name for getting from AssetsManager
 *     "sceneName": "some_scene",
 *     "path": "assets/scenes/" - path to asset's folder
 *   }
 */
export default class SceneLoader extends BaseLoader {

  static name = "PixiSceneLoader";

  load(settings) {
    const {path, sceneName} = settings;
    const pathName = `${path}${sceneName}`;

    const key = super.load(pathName);

    this.loadScript(settings)
      .then((data) => this.loadScene(settings, data))
      .then(data => this.onLoad(settings, data, key));
  }

  loadScene({path}, animationData) {
    const loader = new PIXI.Loader();
    loader.baseUrl = this.manager.resolveURL(path);

    return new Promise(resolve => {
      PIXI.animate.load(animationData, {
        loader,
        complete() {
          animationData.setup(PIXI.animate);
          resolve(animationData);
        }
      });
    });
  }

  /**
   * !! В Adobe Animate в "параметры публикации" нужно выбирать "CommonJS"
   */
  loadScript({path, sceneName}) {
    const scriptPath = this.manager.resolveURL(`${path}${sceneName}.js`);

    return new Promise(resolve => {
      var client = new XMLHttpRequest();
      client.open("GET", scriptPath);
      client.onload = resolve;
      client.send();

    }).then(({target: {response}}) => {
      window.data = {exports: null};
      const script = `(function (module){${response}})(window.data)`;
      eval(script);
      return window.data.exports;
    });
  }
}
