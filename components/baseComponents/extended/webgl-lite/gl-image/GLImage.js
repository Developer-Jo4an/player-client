/* eslint-disable */

import GLComponent from "../GLComponent";
import Shader from "../shaders/image.frag";

export default class GLImageComponent extends GLComponent {
  constructor(container, settings) {
    super(container, Shader);

    const {gl} = this;

    const frontData = settings.images[0];
    const imgTexture = twgl.createTexture(gl, {src: frontData.image});
    const imgDepthTexture = twgl.createTexture(gl, {src: frontData.imageDepth});
    const {uniforms} = this;

    uniforms.doubleTexures = settings.images.length - 1;

    if (settings.images.length > 1) {
      const backgroundData = settings.images[1];
      uniforms.textureBg = twgl.createTexture(gl, {src: backgroundData.image});
      uniforms.textureBgDepth = twgl.createTexture(gl, {src: backgroundData.imageDepth});
      uniforms.thresholdBg = [settings.thresholds[1].x, settings.thresholds[1].y];
      uniforms.offsetBg = [backgroundData.offset || 0, backgroundData.scale || 1];
    }

    this.container = container;
    this.movePosition = [0, 0];
    this.imageAspect = settings.size.height / settings.size.width;

    this.updateResolution();

    uniforms.pixelRatio = 1 / (window.devicePixelRatio || 1);
    uniforms.mouse = [0, 0];
    uniforms.offset = [frontData.offset || 0, frontData.scale || 1];
    uniforms.threshold = [settings.thresholds[0].x, settings.thresholds[0].y];

    uniforms.texture = imgTexture;
    uniforms.textureDepth = imgDepthTexture;

    uniforms.point = settings.point;

  }

  render(time) {
    const {uniforms,movePosition} = this;
    uniforms.mouse[0] += (movePosition[0] - uniforms.mouse[0]) * 0.05;
    uniforms.mouse[1] += (movePosition[1] - uniforms.mouse[1]) * 0.05;
    return super.render(time);
  }

  set mouse({x, y}) {
    const {movePosition} = this;
    movePosition[0] = x;
    movePosition[1] = y;
  }

  updateResolution() {
    const {imageAspect, container} = this;
    const {offsetWidth, offsetHeight} = container;
    let t = offsetHeight / offsetWidth < imageAspect ? 1 : offsetWidth / offsetHeight * imageAspect;
    let e = offsetHeight / offsetWidth < imageAspect ? offsetHeight / offsetWidth / imageAspect : 1;
    this.uniforms.resolution = [offsetWidth, offsetHeight, t, e];
  }

  resize() {
    super.resize();
    this.updateResolution();
  }


}
