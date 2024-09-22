/* eslint-disable */
// Used: https://twgljs.org/
const twgl = require('./twgl.min');
global.twgl = twgl;
import VertShader from "./shaders/default.vert";
import FragShader from "./shaders/default.frag";


class GLComponent {

  enabled = false;

  time = 0;

  upscale = 1;

  uniforms = {};

  constructor(container, fragmentShader, upscale = 1) {

    if (!container) {
      console.log("Container required");
      return;
    }

    this.upscale = upscale;

    this.container = container;
    this._resize = this._resize.bind(this);
    this.vertexShader = VertShader;
    this.fragmentShader = fragmentShader || FragShader;

    const canvas = this.canvas = document.createElement('canvas');
    container.appendChild(canvas);
    this.gl = canvas.getContext("webgl", {
      premultipliedAlpha: false  // Ask for non-premultiplied alpha
    });
    if (!this.gl) this.gl = canvas.getContext("experimental-webgl", {
      premultipliedAlpha: false  // Ask for non-premultiplied alpha
    });
    const {gl} = this;

    console.log('GL', gl);
    gl.disable(gl.DEPTH_TEST);
    // console.log('1 =>', container, canvas, this.vertexShader, this.fragmentShader );
    // console.log('GL =>', gl );

    this.programInfo = twgl.createProgramInfo(gl, [this.vertexShader, this.fragmentShader]);

    const arrays = {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    this.render = this.render.bind(this);
  }

  start() {
    this.enabled = true;
    this.render();
    // console.log('start', this );
  }

  stop() {
    this.enabled = false;
  }

  prerender(time) {
    const {uniforms, gl} = this;
    uniforms.time = time * 0.001;
    uniforms.resolution = [gl.canvas.width, gl.canvas.height];
  }

  render(time) {
    if (!this.enabled) return;

    if (this.prerender) this.prerender(time);
    // console.log('render'); // !!!
    this.time = time;

    const {gl, programInfo} = this;

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
    twgl.setUniforms(programInfo, this.uniforms);
    twgl.drawBufferInfo(gl, this.bufferInfo);

    requestAnimationFrame(this.render);
  }

  resize(timeout = 20) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(this._resize, timeout);
  }

  _resize() {
    const {gl, gl: {canvas}, upscale, container} = this;
    const scale = Math.min(2, window.devicePixelRatio * upscale);
    const width = container.clientWidth * scale;
    const height = container.clientHeight * scale;


    gl.viewport(0, 0, width, height);
    // console.log('gl.resize', this.container, width, height, canvas, this.upscale);
    if (width === this._prevWidth && height === this._prevHeight) return;

    // twgl.resizeCanvasToDisplaySize(canvas, window.devicePixelRatio );
    canvas.width = width;
    canvas.height = height;

    this._prevWidth = width;
    this._prevHeight = height;
  }

}

export default GLComponent;
