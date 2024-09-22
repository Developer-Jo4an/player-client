import PixiController from "../../../utils/scene/containers/PixiController";

export default class AnimationController extends PixiController {

  onResize(size) {

    super.onResize(size);

    if (!size) return;

    const {size: {width, height}} = this;

    const scale = Math.min(size.width / width, size.height / height);

    this.stage.scale.set(scale);
    this.stage.position.set(
      (size.width - width * scale) / 2,
      (size.height - height * scale) / 2
    );
  }
}
