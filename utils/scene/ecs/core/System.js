export default class System {

  updateOrder = 0;

  eventBus;

  _engine;

  constructor({eventBus}) {
    this.eventBus = eventBus;
  }

  init() {

  }

  getEntitiesByType(type) {
    return this._engine.getEntitiesByType(type);
  }


  getBodilessEntities() {
    return this._engine.getBodilessEntities();
  }

  get allComponents() {
    return this._engine.allComponents;
  }

  set engine(engine) {
    this._engine = engine;
  }

  update(data) {

  }

  reset() {
  }


  prestart(levelData){

  }
}

