/* eslint max-classes-per-file: "off" */
import Point from "./Point";
import PathFitter from "./PathFitter";
import DisplacementMap from "./DisplacementMap";
import {Color} from "../utils/color";
import {PaintHistory} from "./History";
import loadImage from "../utils/load-image";
import {SCALE} from "../utils/custom-data";
import EventDispatcher from "../../game/EventDispatcher";

const SMOOTH = true;//!is_ie; // eslint-disable-line camelcase
const _2PI = 2 * Math.PI;
const STAMP_THRESHOLD = 1.2;
const STAMP_SCALE = 2.0;
const PAINT_THRESHOLD = 0.15;
const BACKGROUND_COLOR = "transparent";//#ffffff";

class PaintParams {
  #isStamp = true;

  color = "#000000";

  opacity = 100;

  size = 20;

  brush;

  eraser;

  erSize = 20;

  erOpacity = 100;

  constructor(params) {
    if (params) {
      this.isStamp = params.isStamp;
      this.color = params.color;
      this.opacity = params.opacity;
      this.size = params.size;
      this.brush = params.brush;
      this.eraser = params.eraser;
      this.erSize = params.erSize;
      this.erOpacity = params.erOpacity;
    }
  }

  get isStamp() {
    return this.#isStamp && !this.eraser && this.brush.continuous !== true;
  }

  set isStamp(val) {
    this.#isStamp = val;
  }

  getSize() {
    return (this.eraser ? this.erSize : this.size) * SCALE;
  }

  getOpacity() {
    return this.eraser ? this.erOpacity : this.opacity;
  }

  update(name, val) {
    this[name.replace(/[-_](.)/, ($0, $1) => $1.toUpperCase())] = val;
  }

  initFill(ctx, drawing) {
    if (drawing && this.eraser) {
      ctx.fillStyle = "#000000";
      ctx.canvas.style.opacity = 0.5;
    } else {
      ctx.fillStyle = this.rgba();
    }
    this.initBlendMode(ctx, drawing);
  }

  initStroke(ctx, drawing) {
    ctx.fillStyle = "none";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = this.getSize();
    if (!drawing) {
      ctx.strokeStyle = this.rgba();
    } else if (!this.eraser) {
      ctx.strokeStyle = this.color;
      ctx.canvas.style.opacity = this.getOpacity() / 100;
    } else {
      ctx.strokeStyle = "#000000";
      ctx.canvas.style.opacity = 0.5;
    }

    this.initBlendMode(ctx, drawing);
  }

  initBlendMode(ctx, drawing) {
    ctx.globalCompositeOperation = drawing || !this.eraser ? "source-over" : "destination-out";
  }

  rgba() {
    const clr = new Color(this.color);
    return `rgba(${clr.r}, ${clr.g}, ${clr.b}, ${this.getOpacity() / 100})`
  }

  clone() {
    return new PaintParams(this);
  }
}

export default class PaintCanvas extends EventDispatcher {
  /**
   * @type {HTMLCanvasElement}
   */
  #viewCanvas;

  /**
   * @type {(CanvasRenderingContext2D | null) | (WebGLRenderingContext | null) | (CanvasRenderingContext2D | WebGLRenderingContext | null)}
   */
  #viewCtx;

  #drawCanvas;

  #drawCtx;

  #width = 800;

  #height = 600;

  #bg;

  #bgColor = "#ffffff";

  /**
   *
   * @type {PaintParams}
   */
  #paintParams = new PaintParams();

  // #color = "#ff00ff";
  //
  // #size = 20;

  #mouseEventTrigger;

  #history = new PaintHistory();

  #historyItem;

  #moveThresholdValue = 0;

  #isMouseDowned;

  #scale = 1;

  canPaint = true;

  /**
   *
   * @param {Object} params
   * @param {HTMLCanvasElement?} params.canvas
   * @param {HTMLCanvasElement?} params.drawCanvas
   * @param {HTMLElement?} params.container
   * @param {HTMLElement?} params.mouseEventTrigger
   */
  constructor(params) {
    super();
    const p = params || {};

    const onTouch = () => {
      off(this.#mouseEventTrigger, "mousedown", this.onMouseDown);
      off(this.#mouseEventTrigger, "touchstart", onTouch);
    };

    this.initCanvases(p);

    this.#mouseEventTrigger = params.mouseEventTrigger || this.#drawCanvas;
    on(this.#mouseEventTrigger, "mousedown touchstart", this.onMouseDown);
    on(this.#mouseEventTrigger, "touchstart", onTouch);

    this.init();
  }

  initCanvases(p) {
    [this.#viewCanvas, this.#viewCtx] = PaintCanvas.initCanvas(p.canvas, "2d", p.container);
    [this.#drawCanvas, this.#drawCtx] = PaintCanvas.initCanvas(p.drawCanvas, "2d", p.container);
  }

  static initCanvas(canvas, contextType, container) {
    const _canvas = canvas || document.createElement("canvas");
    let _ctx = _canvas.getContext(contextType, {preserveDrawingBuffer: true});
    if (contextType === "webgl" && !_ctx) {
      _ctx = _canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
    }
    if (container && _canvas.parentNode !== container) {
      container.appendChild(_canvas);
    }

    // if (!_canvas.parentNode) {
    //   document.body.appendChild(_canvas);
    // }
    return [_canvas, _ctx]
  }

  resize = () => {
    this.setSize(this.#drawCanvas.clientWidth, this.#drawCanvas.clientHeight);
    this.redraw();
  };

  setSize(w, h) {
    this.#width = w;
    this.#viewCanvas.width = w;
    this.#drawCanvas.width = w;

    this.#height = h;
    this.#viewCanvas.height = h;
    this.#drawCanvas.height = h;
  }

  /**
   *    ███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗    ███████╗██╗   ██╗███████╗███╗   ██╗████████╗███████╗
   *    ████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝    ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
   *    ██╔████╔██║██║   ██║██║   ██║███████╗█████╗      █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
   *    ██║╚██╔╝██║██║   ██║██║   ██║╚════██║██╔══╝      ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ╚════██║
   *    ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║███████╗    ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ███████║
   *    ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝    ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
   *
   */

  onMouseDown = event => {
    if (this.canPaint && !this.#isMouseDowned) {
      this.#isMouseDowned = true;
      this.startDraw(getPosition(event, this.#scale));
      const [move, up] = event.type === "mousedown" ? ["mousemove", "mouseup"] : ["touchmove", "touchend"];
      on(this.#mouseEventTrigger, move, this.onMouseMove);
      on(document.body, up, this.onMouseUp);
    }
  };

  onMouseMove = (event) => {
    if (this.canPaint) {
      event.preventDefault();
      this.draw(getPosition(event, this.#scale));
    }
  };

  onMouseUp = () => {
    if (this.canPaint) {
      this.#isMouseDowned = false;
      off(this.#mouseEventTrigger, "mousemove touchmove", this.onMouseMove);
      off(document.body, "mouseup touchend", this.onMouseUp);
      this.stopDraw();
      this.dispatchEvent(new Event("draw"));
    }
  };


  /**
   *    ██████╗ ██████╗  █████╗ ██╗    ██╗
   *    ██╔══██╗██╔══██╗██╔══██╗██║    ██║
   *    ██║  ██║██████╔╝███████║██║ █╗ ██║
   *    ██║  ██║██╔══██╗██╔══██║██║███╗██║
   *    ██████╔╝██║  ██║██║  ██║╚███╔███╔╝
   *    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝
   *
   */


  init() {
    this.resize();
    this.redraw();
  }

  #getParams = () => {
    return this.#paintParams.clone();
  };

  startDraw(pos) {
    const ctx = this.#drawCtx;
    this.#moveThresholdValue = this.#paintParams.getSize() * (
      this.#paintParams.isStamp
        ? STAMP_THRESHOLD
        : PAINT_THRESHOLD
    );

    if (!this.#paintParams.isStamp) {
      this.#paintParams.initFill(ctx, true);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.#paintParams.getSize() * 0.5, 0, _2PI);
      ctx.fill();

      this.#paintParams.initStroke(ctx, true);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else {
      this.#paintParams.initFill(this.#viewCtx);
      this.drawStamp(pos, this.#paintParams);
      this.update();
    }

    this.#historyItem = this.#history.add(this.#getParams());
    this.#historyItem.draw(pos);
  }

  draw(pos) {
    const ctx = this.#drawCtx;
    const prev = this.#historyItem.lastPoint;
    if (distance(prev, pos) > this.#moveThresholdValue) {
      if (!this.#paintParams.isStamp) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        this.drawStamp(pos, this.#paintParams);
        this.update();
      }
      this.#historyItem.draw(pos);
    }
  }

  stopDraw() {
    if (!this.#paintParams.isStamp) {
      if (SMOOTH) {
        const fitter = new PathFitter(this.#historyItem).fit(5);
        this.#historyItem.setPath(fitter);
      }
      this.drawPath(this.#historyItem);
      this.update();
    }
  }

  /**
   * @param {PaintHistoryItem} historyItem
   */
  drawPath(historyItem) {
    this.#drawCtx.clearRect(0, 0, this.#width, this.#height);
    const ctx = this.#viewCtx;

    if (!historyItem.params.isStamp) {
      const {path} = historyItem;

      if (historyItem.length < 2) {
        historyItem.params.initFill(ctx);
        ctx.beginPath();
        ctx.arc(historyItem[0].x, historyItem[0].y, historyItem.params.getSize() * 0.5, 0, _2PI);
        ctx.fill();
      } else {
        historyItem.params.initStroke(ctx);
        ctx.beginPath();
        if (path) {
          ctx.moveTo(path[0]._point._x, path[0]._point._y);
          path.slice(1)
            .reduce((prev, segment) => {
              ctx.bezierCurveTo(
                prev._point._x + prev._handleOut._x, prev._point._y + prev._handleOut._y,
                segment._point._x + segment._handleIn._x, segment._point._y + segment._handleIn._y,
                segment._point._x, segment._point._y
              );
              return segment;
            }, path[0]);
        } else {
          ctx.moveTo(historyItem[0].x, historyItem[0].y);
          historyItem.slice(1)
            .forEach(segment => ctx.lineTo(segment.x, segment.y));
        }
        ctx.stroke();
      }
    } else {
      historyItem.params.initFill(ctx);
      historyItem
        .forEach(segment => this.drawStamp(segment, historyItem.params));
      this.update();
    }
  }

  drawStamp(pos, params) {
    const ctx = this.#viewCtx;
    const p = params || this.#paintParams;

    const {brush, x, y, w, h} = p.brush;
    const s = p.getSize() / Math.max(w, h) * STAMP_SCALE;
    ctx.translate(pos.x, pos.y);
    ctx.scale(s, s);
    ctx.translate(x - w * 0.5, y - h * 0.5);
    // ctx.translate(pos.x, pos.y);
    ctx.fill(brush);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  clear() {
    this.#viewCtx.clearRect(0, 0, this.#width, this.#height);
    this.#viewCtx.fillStyle = BACKGROUND_COLOR;
    this.#viewCtx.fillRect(0, 0, this.#width, this.#height);
    this.update();
  }

  redraw() {
    this.clear();

    // let bgColor;
    // let bg;
    this.#history.get().forEach(
      /**
       * @param {PaintHistoryItem} item
       */
      item => {
        // if (item.params.backgroundColor) {
        //   bgColor = item.params.backgroundColor.clr;
        // } else if (item.params.background) {
        //   bg = item.params.background.url;
        // } else {
        this.drawPath(item);
        // }
      }
    );

    // this.changeBackgroundColor(bgColor || BACKGROUND_COLOR);
    // if (bg){
    //   this.changeBackground(bg);
    // }

    this.update();
  }

  /** *
   *    ██╗███╗   ██╗████████╗███████╗██████╗ ███████╗ █████╗  ██████╗███████╗
   *    ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝
   *    ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝█████╗  ███████║██║     █████╗
   *    ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗██╔══╝  ██╔══██║██║     ██╔══╝
   *    ██║██║ ╚████║   ██║   ███████╗██║  ██║██║     ██║  ██║╚██████╗███████╗
   *    ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝
   *
   */

  undo() {
    this.#history.undo();
    this.redraw();
  }

  redo() {
    this.#history.redo();
    this.redraw();
  }

  reset() {
    const done = () => {
      this.#history.reset();
      this.clear();
    };

    if (this.isChanged()) {
      done();
      /*const $modal = showModal("#message-modal", {
        "title": "Сброс прогресса",
        "text": "Начать заново? Текущий прогресс будет сброшен",
        "buttons": [
          {
            "text": "Да",
            "event": "yes"
          },
          {
            "text": "Нет",
            "event": "no"
          }
        ]
      })
        .on("click", "[data-event]", e => {
          if (e.currentTarget.getAttribute("data-event") === "yes") {
            done();
          }
          $modal.trigger("modal:close-request");
        });*/
    } else {
      done();
    }
  }

  getViewCanvas() {
    return this.#viewCanvas;
  }

  // eslint-disable-next-line
  update() {

  }

  updateParams(params) {
    const list = Array.isArray(params) ? params : [params];

    list.forEach(p => {
      switch (p.name) {
        case "bg_color":
          this.setBackgroundColor(p.val);
          break;
        case "bg":
          this.setBackground(p.val);
          break;
        default:
          this.#paintParams.update(p.name, p.val);
          break;
      }
    });
  }

  setBackground(url) {
    this.#bg = url;
    // this.#history.add(
    //   {
    //     background: {
    //       url,
    //       prev: this.#bgColor
    //     }
    //   }
    // );
    this.changeBackground(url);
  }

  setBackgroundColor(clr) {
    this.#bgColor = clr;
    // this.#history.add(
    //   {
    //     backgroundColor: {
    //       clr,
    //       prev: this.#bgColor
    //     }
    //   }
    // );
    this.changeBackgroundColor(clr);
  }

  // eslint-disable-next-line
  changeBackground() {
  }

  // eslint-disable-next-line
  changeBackgroundColor() {
  }

  getResultCanvas() {
    return this.#viewCanvas;
  }

  setScale(val) {
    this.#scale = val;
  }

  toDataUrl() {
    const _canvas = this.getResultCanvas();
    let canvas = _canvas;
    if (SCALE > 1) {
      canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = _canvas.width / SCALE;
      canvas.height = _canvas.height / SCALE;
      ctx.drawImage(_canvas,
        0, 0, _canvas.width, _canvas.height,
        0, 0, canvas.width, canvas.height
      );
    }
    return canvas.toDataURL("image/png");
  }

  /**
   *
   * @return {boolean}
   */
  isChanged() { // eslint-disable-line class-methods-use-this
    return this.#history.length > 0;
  }

  getImageDataUrl() {
    return Promise.resolve(this.toDataUrl());
  }

  getImageBlob() {
    return new Promise(resolve => {
      this.#viewCanvas.toBlob(resolve);
    });
  }
  getImage() {
    return this.getImageBlob();
  }

  isEmpty() {
    const {data} = this.#viewCtx.getImageData(0, 0, this.#viewCanvas.width, this.#viewCanvas.height);
    let i = 3;
    while (i < data.length && data[i] === 0) {
      i += 4;
    }
    return i >= data.length;
  }
}

export class MaskedPaintCanvas extends PaintCanvas {
  #bgCanvas;

  #bgCtx;

  #bg;

  #bgColor = BACKGROUND_COLOR;

  webglCanvas = this.webglCanvas; // если не указать значение - инициализируются как undefined после вызова super

  webglCtx = this.webglCtx; // если не указать значение - инициализируются как undefined после вызова super

  /**
   * @type {DisplacementMap}
   */
  displacementMap;

  constructor(params) {
    super(params);
    this.#bgCanvas = document.createElement("canvas");
    this.#bgCtx = this.#bgCanvas.getContext("2d");

    Promise.all([
      loadImage(params.mask).promise,
      loadImage(params.shadow).promise
    ])
      .then(([mask, shadow]) => {
        this.resetBgCanvas();
        this.displacementMap = new DisplacementMap(
          this.webglCtx,
          this.#bgCanvas,
          mask,
          shadow
        );
        if (this.#bg) {
          this.displacementMap.setBackground(this.#bg);
        }
        // if (this.#bgColor) {
        //   this.displacementMap.setBackgroundColor(this.#bgColor);
        // }
      });

  }

  initCanvases(p) {
    const viewCanvas = p.canvas;
    delete p.canvas;

    super.initCanvases(p);

    const data = PaintCanvas.initCanvas(viewCanvas, "webgl", p.container);
    [this.webglCanvas, this.webglCtx] = data;
    // [this.#webglCanvas, this.#webglCtx] = data;
  }

  setSize(w, h) {
    super.setSize(w, h);
    this.webglCanvas.width = w;
    this.webglCanvas.height = h;
  }

  update() {
    if (this.displacementMap) {
      this.resetBgCanvas();

      this.displacementMap.update();
    }
  }

  resetBgCanvas() {
    const viewCanvas = super.getViewCanvas();
    this.#bgCanvas.width = viewCanvas.width;
    this.#bgCanvas.height = viewCanvas.height;
    this.#bgCtx.fillStyle = this.#bgColor;
    this.#bgCtx.fillRect(0, 0, viewCanvas.width, viewCanvas.height);
    this.#bgCtx.drawImage(viewCanvas, 0, 0);
  }

  setBackground(val) {
    this.#bg = val;
    super.setBackground(val);
  }

  setBackgroundColor(val) {
    this.#bgColor = val;
    super.setBackgroundColor(val)
  }

  changeBackground(val) {
    super.changeBackground(val);
    if (this.displacementMap) {
      this.displacementMap.setBackground(val);
    }
  }

  // changeBackgroundColor(val) {
  //   super.changeBackgroundColor(val);
  //   if (this.displacementMap) {
  //     this.displacementMap.setBackgroundColor(val);
  //   }
  // }

  getResultCanvas() {
    return this.webglCanvas;
  }

  // toDataUrl() {
  //   return super.toDataURL();
  // }

  // getImage() {
  //   return new Promise(resolve => {
  //     this.displacementMap.ondraw = () => {
  //       this.displacementMap.ondraw = undefined;
  //       resolve(this.toDataUrl());
  //     }
  //   });
  // }
}

/**
 *    ██╗   ██╗████████╗██╗██╗     ███████╗
 *    ██║   ██║╚══██╔══╝██║██║     ██╔════╝
 *    ██║   ██║   ██║   ██║██║     ███████╗
 *    ██║   ██║   ██║   ██║██║     ╚════██║
 *    ╚██████╔╝   ██║   ██║███████╗███████║
 *     ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝
 *
 */

function distance(p1, p2) {
  const x = p1.x - p2.x;
  const y = p1.y - p2.y;
  return Math.sqrt(x * x + y * y);
}

function getPosition(event, scale) {
  const t = event.touches && event.touches.length ? event.touches[0] : event;
  if (typeof t.offsetX !== "undefined") {
    return new Point(t.offsetX, t.offsetY);
  }

  const offset = event.currentTarget.getBoundingClientRect();
  return new Point((t.clientX - offset.left) / scale, (t.clientY - offset.top) / scale);
}

function on(emitter, events, callback) {
  events.split(" ")
    .forEach(ev => {
      emitter.addEventListener(ev, callback);
    });
}

function off(emitter, events, callback) {
  events.split(" ")
    .forEach(ev => {
      emitter.removeEventListener(ev, callback);
    });
}
