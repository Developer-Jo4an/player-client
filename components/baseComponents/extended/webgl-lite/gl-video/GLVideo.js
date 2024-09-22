/* eslint-disable */

import GLComponent from '../GLComponent';
import VideoFragShader from '../shaders/video.frag.js';

const twgl = global.twgl;

class GLVideo extends GLComponent {

  copyVideo;

  constructor(container, videoOrUrl, fragmentShader, upscale = 1) {

    if (!videoOrUrl) {
      console.warn('Video Url required.');
      return;
    }

    const receivedVideoObject = typeof videoOrUrl !== 'string';
    console.log('GLVideo @1', container, videoOrUrl, receivedVideoObject, upscale);

    fragmentShader = fragmentShader || VideoFragShader;
    super(container, fragmentShader, upscale);

    const gl = this.gl;

    // Texture
    this.texture = twgl.createTexture(gl, {
      src: [0, 0, 0, 0],
      format: gl.RGBA,
      min: gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
    });

    this.uniforms.texture = this.texture;

    console.log('GLVideo @2', container, videoOrUrl);

    // Video
    const video = this.video = receivedVideoObject ? videoOrUrl : document.createElement('video');
    if (!receivedVideoObject) {
      video.src = videoOrUrl;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
    }

    const onPlaying = () => {
      console.log('copy video');
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      this.videoIsReady = true;
      this.resize(0);
    };

    video.addEventListener("playing", onPlaying, {capture: true, once: true});
  }

  prerender(time) {
    const {uniforms, gl} = this;

    if (this.videoIsReady) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video);
    }

    uniforms.time = time * 0.01;
    uniforms.resolution = [gl.canvas.width, gl.canvas.height];

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

  }

  play() {
    this.video.play();
    this.start();
  }

  pause() {
    this.stop();
    this.video.pause();
  }

}

export default GLVideo;

