import System from "../../../core/System";
import InputController from "../../../../controllers/input/InputController";

export default class InputSystem extends System {

  constructor(data) {
    super(data);
    const {inputSystem: {preset, plugins = []} = {}} = data;

    this.inputController = new InputController({
      eventBus: this.eventBus,
      basePlugins: plugins.map(Plugin => new Plugin)
    });

    if (preset)
      this.addPreset(preset);
    else console.log("InputSystem preset not found");
  }

  addPreset(presetActions) {
    this.inputController.addPreset(presetActions);
  }
}
