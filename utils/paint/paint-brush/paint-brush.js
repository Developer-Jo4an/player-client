/* eslint max-classes-per-file: "off" */
import {
  registerPlugins,
  Plugin
} from "../../../framework/jquery/plugins/plugins";

// const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

class Brush {
  id;

  brush;

  continuous;

  x;

  y;

  w;

  h;

  constructor(symbol) {
    this.symbol = symbol;
    this.id = symbol.id;
    // const c = symbol.children[0];
    const c = symbol.firstElementChild;
    const path = c.getAttribute("d");
    const viewBox = symbol.getAttribute("viewBox").split(" ");

    this.x = -viewBox[0];
    this.y = -viewBox[1];
    this.w = +viewBox[2];
    this.h = +viewBox[3];
    this.brush = new Path2D(path);
    this.continuous = this.id === "svg_a-ellipse";
  }
}

class PaintBrush extends Plugin {

  constructor($element) {
    super($element);

    const brushes = getBrushes($element.find(".paint-brush__lib symbol"));
    const brushById = brushes.reduce((res, b) => {
      res[b.id] = b;
      return res;
    }, {});

    $element.find(".paint-brush__tpl")
      .templateEngine(brushes.map(b => ({id: b.id})));

    const $inputs = $element.find(".paint-brush__item-input")
      .on("input:getvalue", (e, prop) => {
        prop.exports = getVal();
      })
      .on("change", () => {
        $element.trigger("paint-params:change", getVal());
      });

    $inputs.eq(0).prop("checked", true).change();

    /* function getBrushes() {
      const W = 100;
      const H = 100;
      const IMG_W = 500;
      const IMG_H = 500;
      const COLS = IMG_W / W;
      const ROWS = IMG_H / H;
      const COUNT = 9;
      const arr = [];

      for (let i = 0; i < COUNT; i++) {
        const x = i % COLS;
        const y = i / COLS | 0;
        arr.push(`background-position:${percentage(x / (COLS - 1))} ${percentage(y / (ROWS - 1))}`);
      }

      return arr;

      function percentage(val) {
        return `${val * 100}%`;
      }
    } */

    function getVal() {
      const $checked = $inputs.filter(":checked");
      return {
        name: $checked.attr("name"),
        val: brushById[$checked.val()]
      }
    }

    function getBrushes($symbols) {
      return $symbols
        .map((i, itm) => new Brush(itm))
        .get();
    }
  }
}


registerPlugins({
  name: "paintBrush",
  Constructor: PaintBrush,
  selector: ".paint-brush"
});
