import {
  registerPlugins,
  Plugin
} from "../../../framework/jquery/plugins/plugins";

class PaintEraser extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor($element) {
    super($element);

    const $input = $element.find(".paint-eraser__input");
    const name = $input.attr("name");

    $input
      .on("change", () => {
        $element.trigger("paint-params:change", {
          name,
          val: $input.is(":checked")
        });
      });
  }
}

registerPlugins({
  name: "paintEraser",
  Constructor: PaintEraser,
  selector: ".paint-eraser"
});
