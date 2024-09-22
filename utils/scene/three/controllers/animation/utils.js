import AssetsManager from "../../../loader/plugins/AssetsManager";
import Animation from "./Animation";

export function initAnimations({
                                 modelName,
                                 model = AssetsManager.getAssetFromLib(modelName, "gltf"),
                                 target, // если model === target && [THREE.AnimationMixer(target)] - анимации не проигрываются
                                 eventBus
                               }) {

  console.log("model", modelName, AssetsManager.lib, model);

  const items = [];

  model.animations.forEach(({name}) => {
    const animation = new Animation({
      model,
      target,
      name,
      customClip: true,
      eventBus,
    });
    AssetsManager.addAssetToLib(animation, `${modelName}_${name}_original`, "animation");
    items.push(`${modelName}_${name}_original`);
  });

  console.log("initAnimations");
  console.table(items);
}
