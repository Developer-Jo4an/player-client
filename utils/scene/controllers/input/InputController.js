import Preset from "./Preset";

export default class InputController {

  _presets = {};

  _basePlugins = [];

  constructor({eventBus, basePlugins} = {}) {
    this.eventBus = eventBus;
    this._basePlugins = basePlugins ?? this._basePlugins;
  }

  getActionData(presetName, actionName) {
    return this._presets[presetName]?.getActionByName(actionName);
  }

  getPluginByName(name) {
    return this._basePlugins.find(({name: pluginName}) => name === pluginName);
  }

  addPreset(presetData) {
    if (!presetData.name) return console.log("preset's name is not defined");
    const {eventBus} = this;
    const preset = new Preset(presetData, eventBus);
    this._presets[presetData.name] = preset;
    this.checkActions(preset.actions);
  }

  checkActions(actions) {
    const {_basePlugins} = this;
    actions.forEach(action => {
      _basePlugins.forEach(plugin => {
        if (plugin.checkAction(action))
          plugin.addAction(action)
      })
    });
  }
}
