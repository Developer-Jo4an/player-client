import Entity from "./Entity";
import Collection from "../../structures/Collection";
import Component from "./Component";

export default class Engine {

  systems = new Collection({name: "systems"});

  entities = {};

  components = {};

  constructor({eventBus}) {
    this.eventBus = eventBus;

    this.addListeners();
  }

  addSystem(system) {
    const {systems} = this;
    systems.add(system);
    system.engine = this;
    system.init();

    systems.sort((a, b) => a.updateOrder - b.updateOrder);
  }

  getEntitiesByType(type) {
    return this.entities[type];
  }

  get allComponents() {
    return Object.values(this.components).reduce((result, {list}) => [...result, ...list], []);
  }

  removeSystem(system) {
    const {systems} = this;
    systems.remove(system);
    system.engine = null;
  }

  addListeners() {
    this.addEntityListeners();
    this.addComponentListeners();
  }

  addComponentListeners() {
    const {eventBus} = this;
    eventBus.addEventListener(Component.EVENTS.CHANGE, this.onComponentChanged.bind(this));
    eventBus.addEventListener(Component.EVENTS.ADD, this.onComponentAdded.bind(this));
    eventBus.addEventListener(Component.EVENTS.REMOVE, this.onComponentRemoved.bind(this));
    eventBus.addEventListener(Component.EVENTS.CREATE, this.onComponentCreated.bind(this));
  }

  onComponentChanged({data: {component, component: {type}}}) {
  }

  onComponentAdded({data: {component, component: {type}}}) {
    this.checkComponentCollection(type);
  }

  onComponentRemoved({data: {component, component: {type}}}) {
    this.checkComponentCollection(type);

    this.components[type].add(component)
  }

  onComponentCreated({data: {component, component: {type}}}) {
    this.checkComponentCollection(type);

    this.components[type].add(component)
  }

  checkComponentCollection(type) {
    if (!this.components[type])
      this.components[type] = new Collection({name: type})
  }

  addEntityListeners() {
    const {eventBus} = this;
    eventBus.addEventListener(Entity.EVENTS.CHANGE, this.onEntityChanged.bind(this));
    eventBus.addEventListener(Entity.EVENTS.REMOVE, this.onEntityRemoved.bind(this));
    eventBus.addEventListener(Entity.EVENTS.CREATE, this.onEntityCreated.bind(this));
  }

  onEntityChanged({data: {entity}}) {
    //TODO: реализовать идею подписки на изменение определенного типа сущностей
  }

  onEntityRemoved({data: {entity, entity: {type}}}) {
    this.checkEntityCollection(type);
    this.entities[type].remove(entity);
  }

  onEntityCreated({data: {entity, entity: {type}}}) {
    this.checkEntityCollection(type);
    this.entities[type].add(entity);
  }

  checkEntityCollection(type) {
    if (!this.entities[type])
      this.entities[type] = new Collection({name: type})
  }

  update(data) {
    this.systems.list.forEach(system => system.update(data));
  }

  reset() {
    this.systems.list.forEach(system => system.reset());
  }

  prestart(levelData) {
    this.systems.list.forEach(system => system.prestart(levelData));
  }

}
