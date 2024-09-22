import {
  registerPlugins,
  Plugin
} from "../../../framework/jquery/plugins/plugins";
import {getBackgrounds} from "../../custom-data/custom-data";

class PaintBg extends Plugin {
  constructor($element) {
    super($element);

    getBackgrounds().then((brushes) => {
      this.initBackground($element, brushes);
    });
  }

  initBackground($element, brushes) {
    $element.find(".paint-bg__tpl")
      .templateEngine(brushes);

    const $inputs = $element.find(".paint-bg__item-input")
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
      }
    }
  }
}


registerPlugins({
  name: "paintBg",
  Constructor: PaintBg,
  selector: ".paint-bg"
});
