import MeshCurvedMaterial from "../../materials/MeshCurvedMaterial";
import {BaseController} from "../../../../../controllers/runner/BaseController";

export default class CurvedMaterialController extends BaseController {

  lastPosition = null;

  _currentLength = 0;

  _progressAreaX = 0;

  active = true;

  materials = [];

  materialData = {};

  constructor(data = {}) {
    const {eventBus} = data;
    super(data);
    if (!eventBus)
      return console.log("has no event emmiter");
    this.eventBus = eventBus;
    eventBus.addEventListener("hero:position-changed", this.onMoving.bind(this));
    this.eventBus.addEventListener("place-item", this.onCreate.bind(this));
    this.eventBus.addEventListener("remove-item", this.onRemove.bind(this));
    this.eventBus.addEventListener("append-item", this.onCreate.bind(this));
  }


  initData = (curvedMaterialSettings = {}) => {
    const {curvedAreaXLength, ..._settings} = curvedMaterialSettings;
    this._settings = _settings;
    this.curvedAreaXLength = curvedAreaXLength;
    this.initUniformsData();
  }

  initUniformsData() {
    if (!this._settings) return;
    const {_settings} = this;
    Object.entries(_settings).forEach(([key, value]) => this.materialData[key] = value);
  }

  set progressAreaX(value) {
    this._progressAreaX = Math.max(0, Math.min(1, value));
  }

  get progressAreaX() {
    return this._progressAreaX;
  }


  onCreate({data: {item}}) {
    if (!item) return;

    item.traverse(({material}) =>
      material &&
      material instanceof MeshCurvedMaterial &&
      !this.materials.includes(material) &&
      this.materials.push(material)
    );
  }

  onRemove({data: {item}}) {
    if (!item) return;
    const {materials} = this;

    item.traverse(({material}) => {
      if (material && material instanceof MeshCurvedMaterial) {
        const index = materials.indexOf(material);
        index !== -1 && this.materials.splice(index, 1);
      }
    });
  }

  get xDirection() {
    return this.getUniformByName("xDirection");
  }

  set xDirection(value) {
    this.setUniformByName("xDirection", value);
  }

  get xDirections() {
    return this.getUniformByName("xDirections");
  }


  onMoving({data: {hero}}) {
    if (!this.lastPosition) {
      this.lastPosition = hero.position.clone();
      this.turn();
    }

    if (this.active)
      this.onMoveActions(hero);

    this.lastPosition.copy(hero.position);
  }


  set currentLength(value) {
    this._currentLength = value;
    this.progressAreaX = Math.max(0, Math.min(1, this.currentLength / this.curvedAreaXLength));

    if (this.currentLength > this.curvedAreaXLength)
      this.turn();

    this.applyDirection();
  }

  get currentLength() {
    return this._currentLength;
  }

  onMoveActions(hero) {
    const {lastPosition} = this;
    const delta = hero.position.clone().sub(lastPosition);
    this.currentLength += Math.abs(delta.z);
  }

  get roadTurnProgress() {
    const {progressAreaX} = this;    // [0,1] => [0,...,1,...0];

    const progress = -1 * (2 * progressAreaX - 1) ** 2 + 1;
    // const progress = 1 - Math.abs(progressAreaX - .5) * 2;
    return Math.max(0, Math.min(1, progress));
  }

  setUniformByName(name, value) {
    if (!name) return;

    value = Math.round(value * 1000) / 1000
    this.materials.forEach(material => {
      if (material.shader)
        material.shader.uniforms[name].value = value;
      else
        material._uniforms[name].value = value;
    });
    this.materialData[name] = value;
  }

  getUniformByName(name) {
    return this.materialData[name];
  }

  applyDirection() {
    if (!this.directionData) return;
    const {directionData: {xDirection, nextDirection}} = this;
    const deltaDirection = (nextDirection - xDirection);
    this.xDirection = deltaDirection * this.roadTurnProgress;
  }


  turn() {
    const {xDirection, currentLength, curvedAreaXLength, xDirections} = this;
    const nextDirection = xDirections[Math.floor(xDirections.length * Math.random())];
    this.currentLength = Math.max(0, currentLength - curvedAreaXLength);

    this.directionData = {
      xDirection,
      nextDirection,
    };
  }


  reset() {
    this.directionData = null;
    this.initUniformsData();
    this.progressAreaX = 0;
    this.currentLength = 0;
    this.xDirection = 0;
    this.materials.length = 0;
  }

}
