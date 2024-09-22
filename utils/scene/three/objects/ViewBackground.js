import AssetsManager from "../../loader/plugins/AssetsManager";
import {isMobile} from "../../../detector/detector";

export default class ViewBackground extends THREE.Object3D {

  settings = null;

  plane = null;

  constructor({settings}) {
    super();

    this.name = "viewBackground";

    const {mobileExtend = {}} = settings;
    this.settings = {...settings, ...(isMobile() ? mobileExtend : {})};
    this.initPlane();
  }

  get offsetZ() {
    const {settings: {camera: {far}}} = this;
    return far * .9;
  }

  initPlane() {
    const {settings, settings: {offsetY = 0, height = 1}} = this;
    const map = AssetsManager.getAssetFromLib(settings.map, "texture");
    const aspect = map.image.width / map.image.height;

    let width = height * aspect;

    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({map, transparent: true});

    const scale = height / map.image.height;
    const plane = new THREE.Mesh(geometry, material);
    this.plane = plane;
    plane.name = settings.map;
    plane.scale.set(scale, scale, scale);
    this.add(plane);

    plane.position.set(0, offsetY, this.offsetZ);
  }

  update(data) {
    this.plane.position.z = -(this.offsetZ + data.offset);
  }
}
