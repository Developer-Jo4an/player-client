export default class Entity {

  static EVENTS = {
    CHANGE: "entity:change",
    REMOVE: "entity:remove",
    CREATE: "entity:create",
    ENABLE: "entity:enable",
    DISABLE: "entity:disable",
  }

  type = "unknown";

  group = "unknown";

  children = [];

  eventBus;

  settings = {};

  constructor({eventBus, type, group, ...settings}) {
    this.eventBus = eventBus;
    this.type = type ?? this.type;
    this.group = group ?? this.type;
    this.settings = settings ?? this.settings;
  }

  getComponentByType(type) {
    return this.children.find(({type: cType}) => cType === type);
  }

  getComponentByBaseType(type) {
    return this.children.find(({baseType: cType}) => cType === type);
  }

  getP2Body() {
    return this.children.find(({p2Body}) => !!p2Body)?.p2Body;
  }

  init() {
    this.onCreate();
  }

  add(child) {
    this.children.push(child);
    child.entity = this;
    this.onChange();
  }

  remove(child) {
    if (!this.children.includes(child)) return;

    this.children.splice(this.children.indexOf(child), 1);
    child.entity = null;
  }

  destroy() {
    this.removeAll();
    this.onRemove();
  }

  removeAll() {
    const {children} = this;
    children.forEach(child => child.entity = null);
    children.length = 0;
  }

  dispatch(type, data) {
    this.eventBus.dispatchEvent({type, data})
  }

  onCreate() {
    this.dispatch(Entity.EVENTS.CREATE, {entity: this})
  }

  onRemove() {
    this.dispatch(Entity.EVENTS.REMOVE, {entity: this})
  }

  onChange() {
    this.dispatch(Entity.EVENTS.CHANGE, {entity: this})
  }

  disable() {
    this.dispatch(Entity.EVENTS.DISABLE, {entity: this})
  }

  enable() {
    this.dispatch(Entity.EVENTS.ENABLE, {entity: this})
  }

}
