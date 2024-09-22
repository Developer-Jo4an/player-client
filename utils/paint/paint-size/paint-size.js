import "rangeslider.js"; // eslint-disable-line
import {
  registerPlugins,
  Plugin
} from "../../../framework/jquery/plugins/plugins";
import { mix } from "../../../framework/utils/random";

class PaintSize extends Plugin {
  constructor($element) {
    super($element);

    const scale = $element.data("range");

    const $input = $element.find(".paint-size__input");
    const $valView = $element.find(".paint-size__output-val");
    const name = $input.attr("name");
    let isInitialized;

    $element.find(".paint-size__btn").on("click", onButtonClick);

    $input
      .on("input:getvalue", (e, prop) => {
        prop.exports = getVal();
      })
      .on("change", () => {
        $element.trigger("paint-params:change", getVal());
      });
    // noUiSlider.create($element.get(0), {
    //   start: 10,
    //   range: {
    //     min: 2,
    //     max: 20
    //   },
    //   behaviour: "tap-drag",
    //   pips: {
    //     mode: "steps",
    //     stepped: true,
    //     density: 4
    //   }
    // })

    this.update = () => {
      if (!isInitialized) {
        isInitialized = true;
        $input.rangeslider({
          rangeClass: "rangeslider paint-size__rangeslider",
          fillClass: "rangeslider__fill paint-size__rangeslider-fill",
          handleClass: "rangeslider__handle paint-size__rangeslider-handle",
          onSlide: (/* pos, val */) => {
            const v = getVal();
            $element.trigger("paint-params:slide", v);
            // showVal(v);
          },
          polyfill: false
        });
      } else {
        $input.rangeslider("update", false);
      }
    };

    function getVal() {
      let val = $input.val();
      if (scale) {
        const min = +$input.attr("min");
        const max = +$input.attr("max");
        const r = (val - min) / (max - min) * (scale.length - 1);
        val = mix(scale[Math.floor(r)], scale[Math.ceil(r)], r - Math.floor(r));
      }
      showVal(val);
      return { name, val };
    }

    function showVal(val) {
      $valView.text(Math.round(val));
    }

    function onButtonClick(e) {
      const steps = 6;
      let delta;
      switch (e.currentTarget.getAttribute("data-paint-size")) {
        case "plus":
          delta = 1 / steps;
          break;
        case "minus":
          delta = -1 / steps;
          break;
        default:
          break;
      }

      if (delta) {
        const dd = +$input.attr("max") - $input.attr("min");
        const val = Math.round((+$input.val() / dd + delta) * steps) / steps * dd;
        $input.val(val).change();
      }
    }
  }
}

registerPlugins({
  name: "paintSize",
  Constructor: PaintSize,
  selector: ".paint-size"
});
