import {
  registerPlugins,
  Plugin
} from "../../../framework/jquery/plugins/plugins";
import { getColors } from "../../custom-data/custom-data";

class PaintColor extends Plugin {
  /* constructor($element) {
    super($element);

    const $input = $element.find(".paint-color__input");
    const name = $input.attr("name");

    $input
      .on("change", () => {
        $element.trigger("paint-params:change", {
          name,
          val: $input.val()
        });
      });
  } */

  constructor($element) {
    super($element);

    const colors = getColors();

    $element.find(".paint-color__tpl")
      .templateEngine(colors.map(b => ({id: b.id})));

    const $inputs = $element.find(".paint-color__item-input")
      .on("input:getvalue", (e, prop) => {
        prop.exports = getVal();
      })
      .on("change", () => {
        $element.trigger("paint-params:change", getVal());
      });

    $inputs.eq(0).prop("checked", true).change();

    function getVal() {
      const $checked = $inputs.filter(":checked");
      return {
        name: $checked.attr("name"),
        val: $checked.val()
      };

    }

  }
}

registerPlugins({
  name: "paintColor",
  Constructor: PaintColor,
  selector: ".paint-color"
});
