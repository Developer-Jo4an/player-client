export default class Component {

  static EVENTS = {
    CHANGE: "component:change",
    REMOVE: "component:remove",
    ADD: "component:add",
    CREATE: "component:create",
  }

  type = "unknown";

  eventBus;

  _entity = null;

  constructor({eventBus}) {
    this.eventBus = eventBus;
  }

  set entity(entity) {
    this._entity = entity;
    if (entity)
      this.onAdd();
    else
      this.onRemove();
  }

  get entity() {
    return this._entity;
  }

  init() {
    this.onCreate();
    return this;
  }

  dispatch(type, data) {
    this.eventBus.dispatchEvent({type, data})
  }

  onCreate() {
    this.dispatch(Component.EVENTS.CREATE, {component: this})
  }

  onAdd() {
    this.dispatch(Component.EVENTS.ADD, {component: this})
  }

  onRemove() {
    this.dispatch(Component.EVENTS.REMOVE, {component: this})
  }

  onChange() {
    this.dispatch(Component.EVENTS.CHANGE, {component: this})
  }
}
