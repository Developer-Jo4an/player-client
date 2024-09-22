import {
  registerPlugins,
  Plugin
} from "../../../framework/jquery/plugins/plugins";

class PaintActions extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor($element) {
    super($element);
  }
}

registerPlugins({
  name: "paintActions",
  Constructor: PaintActions,
  selector: ".paint-actions"
});
