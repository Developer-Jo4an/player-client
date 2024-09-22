// import { Color } from "../../../framework/utils/color";
import loadImage from "../utils/load-image";
import { HEIGHT, SCALE, WIDTH } from "../utils/custom-data";

const vertex = `precision mediump float;
attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0, 1);
}`;

const fragment = `precision mediump float;
uniform sampler2D u_paint;
uniform sampler2D u_map;
uniform sampler2D u_shadow;
uniform sampler2D u_background;

// uniform vec4 u_background_clr;

uniform vec2 u_paint_size;
uniform vec2 u_map_size;
uniform vec2 u_background_size;

uniform float u_offset_val;

vec4 overlay(vec4 src, vec4 dst) {
  float final_alpha = src.a + dst.a * (1.0 - src.a);
  return vec4(
      (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / final_alpha,
      final_alpha
  );
}

void main() {
  vec2 bgPos = (gl_FragCoord.xy - (u_paint_size - u_background_size) * 0.5) / u_background_size;

  if (abs(0.5 - bgPos.x) > 0.5 || abs(0.5 - bgPos.y) > 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    float offsetVal = u_offset_val; // 30.0;
    vec2 offset = vec2(offsetVal, offsetVal);

    vec2 pos = (gl_FragCoord.xy - (u_paint_size - u_map_size) * 0.5) / u_map_size;

    vec4 bg = texture2D(u_background, bgPos);
    vec4 map = texture2D(u_map, pos);
    vec4 shad = texture2D(u_shadow, pos);

    vec2 displacementPos = gl_FragCoord.xy + offset * (0.5 - map.rg);
    vec4 canvas = texture2D(u_paint, displacementPos / u_paint_size);

    // vec4 result = overlay(canvas, u_background_clr);
    // result = overlay(shad, result);

    // vec4 result = overlay(shad, canvas);
    // result = result * map.b;
    // result = overlay(result, bg);

    vec4 result = canvas;
    result = result * map.b;
    result = overlay(result, bg);
    result = overlay(shad, result);

    gl_FragColor = result;
  }
}`;


export default class DisplacementMap {
  GL;

  PROGRAM;

  paintCanvas;

  mask;

  uTexture;

  program;

  #bgUrl;

  /**
   *
   * @param GL - webgl контекст
   * @param paintCanvas - рисовалка
   * @param mask - маска
   * @param shadows - свето-тени
   */
  constructor(GL, paintCanvas, mask, shadows) {
    this.paintCanvas = paintCanvas;
    this.mask = mask;
    this.GL = GL;


    this.clearCanvas();
    this.createPlane();
    this.PROGRAM = this.createProgram();
    // global.GL = this.GL;
    // global.PROGRAM = this.PROGRAM;
    if (this.PROGRAM) {
      this.createTexture(paintCanvas, mask, shadows);
      this.updateCanvasSize();
      // initEventListeners();
      this.draw();
    }
  }



  clearCanvas() {
    const { GL } = this;
    GL.clearColor(1.0, 1.0, 1.0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT);
  }


  createPlane() {
    const { GL } = this;
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(
      GL.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        -1,  1,
        1, -1,
        1,  1
      ]),
      GL.STATIC_DRAW
    );
  }


  createProgram() {
    const { GL } = this;
    const shaders = this.getShaders();

    const PROGRAM = GL.createProgram();
    this.program = PROGRAM;

    GL.attachShader(PROGRAM, shaders.vertex);
    GL.attachShader(PROGRAM, shaders.fragment);
    GL.linkProgram(PROGRAM);

    if (!GL.getProgramParameter(PROGRAM, GL.LINK_STATUS)) {
      // eslint-disable-next-line
      console.log(`Shader program did not link successfully. Error log: ${GL.getProgramInfoLog(PROGRAM)}`);
      return null;
    }

    const vertexPositionAttribute = GL.getAttribLocation(PROGRAM, 'a_position');

    GL.enableVertexAttribArray(vertexPositionAttribute);
    GL.vertexAttribPointer(vertexPositionAttribute, 2, GL.FLOAT, false, 0, 0);

    GL.useProgram(PROGRAM);

    return PROGRAM;
  }


  getShaders() {
    const { GL } = this;
    return {
      vertex: this.compileShader(GL.VERTEX_SHADER, vertex),
      fragment: this.compileShader(GL.FRAGMENT_SHADER, fragment)
    };
  }

  compileShader(type, source) {
    const { GL } = this;
    const shader = GL.createShader(type);

    GL.shaderSource(shader, source);
    GL.compileShader(shader);

    return shader;
  }


  createTexture(image1, image2, image3) {
    const { GL } = this;
    this.uTexture = this.createTextureItem(image1, "u_paint", 0, GL.CLAMP_TO_EDGE);
    this.createTextureItem(image2, "u_map", 1, GL.CLAMP_TO_EDGE);
    this.createTextureItem(image3, "u_shadow", 2, GL.CLAMP_TO_EDGE);
  }

  createTextureItem(img, name, index, repeat) {
    const { GL, PROGRAM } = this;
    if (GL && PROGRAM) {
      const texture = GL.createTexture();
      GL.activeTexture(GL.TEXTURE0 + index);
      GL.bindTexture(GL.TEXTURE_2D, texture);
      GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
      GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, repeat);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, repeat);
      // GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
      GL.uniform1i(GL.getUniformLocation(PROGRAM, name), index);
      return {index: GL.TEXTURE0 + index, texture};
    }

    return null;
  }



  updateCanvasSize() {
    const { GL, PROGRAM, paintCanvas, mask } = this;
    GL.viewport(0, 0, GL.canvas.width, GL.canvas.height);
    GL.uniform1f(GL.getUniformLocation(PROGRAM, 'u_offset_val'), 30);
    GL.uniform2f(GL.getUniformLocation(PROGRAM, 'u_paint_size'), paintCanvas.width, paintCanvas.height);
    GL.uniform2f(GL.getUniformLocation(PROGRAM, 'u_map_size'), mask.width, mask.height);
  }


  // initEventListeners() {
  // }


  draw = () => {
    const { GL } = this;
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);

    /* if (global.save) {
      global.save = false;
      const img = new Image();
      document.body.appendChild(img);
      img.src = GL.canvas.toDataURL();
    } */

    this.trigger("draw");

    requestAnimationFrame(this.draw);
  };

  trigger(event) {
    if (this[`on${event}`]) {
      this[`on${event}`]();
    }
  }

  update() {
    const { GL, uTexture, paintCanvas } = this;
    GL.activeTexture(uTexture.index);
    GL.bindTexture(GL.TEXTURE_2D, uTexture.texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, paintCanvas);
  }

  setBackground(val) {
    this.#bgUrl = val;
    loadImage(val)
      .promise
      .then(img => {
        const { GL, uBackground, PROGRAM } = this;
        if (!PROGRAM) {
          return;
        }
        if (this.#bgUrl === val) {
          if (!uBackground) {
            this.uBackground = this.createTextureItem(img, "u_background", 3, GL.CLAMP_TO_EDGE);
          } else {
            GL.activeTexture(uBackground.index);
            GL.bindTexture(GL.TEXTURE_2D, uBackground.texture);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img);
          }
          // GL.uniform2f(GL.getUniformLocation(PROGRAM, 'u_background_size'), img.width, img.height);
          GL.uniform2f(GL.getUniformLocation(PROGRAM, 'u_background_size'), WIDTH * SCALE, HEIGHT * SCALE);
        }
      });
  }

  // setBackgroundColor(val) {
  //   const { GL, PROGRAM } = this;
  //   if (PROGRAM) {
  //     const color = new Color(val);
  //     GL.uniform4fv(GL.getUniformLocation(PROGRAM, 'u_background_clr'), [color.r / 255, color.g / 255, color.b / 255, 1.0]);
  //   }
  // }
}
