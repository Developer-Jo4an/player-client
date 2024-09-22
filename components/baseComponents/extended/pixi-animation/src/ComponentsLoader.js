import AssetsManager from "../../../utils/scene/loader/plugins/AssetsManager";
import Loader from "../../../utils/scene/loader/Loader";
import {pixiManager} from "../../../utils/scene/loader/plugins/pixi/PixiManager";

Loader.registerManager(pixiManager, "pixijs");

export class ComponentsLoader {


  async load(preload) {
    return Promise.all( preload.map(item => this[`${item.type}LoadPromise`](item)))
  }

  sceneLoadPromise(item) {
    if (!AssetsManager.isAssetIsRegistered(`${item.name}_loading`, "promise")) {
      const promise = Loader.load([item])
        .then(() => {
          const data = AssetsManager.getAssetFromLib(item.name, item.type);
          global.window[`__${item.name}`] = data;
        })
      AssetsManager.addAssetToLib(promise, `${item.name}_loading`, "promise")
    }

    return AssetsManager.getAssetFromLib(`${item.name}_loading`, "promise")
  }
}

const loader = new ComponentsLoader();

export default loader
