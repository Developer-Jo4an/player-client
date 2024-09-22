import AssetsManager from "../../loader/plugins/AssetsManager";

export default class CameraBackground extends THREE.Object3D {

  name = "CameraBackground";

  needsUpdate = true;

  renderOrder = -999;

  constructor({map}) {
    super();

    if (typeof map === "string")
      map = AssetsManager.getAssetFromLib(map, "texture");

    this.initPlane({map});
  }

  initPlane({map}) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map,
      depthWrite: false,
      depthTest: false
    });

    map.generateMipmaps = false;

    const plane = this.plane = new THREE.Mesh(geometry, material);

    const container = this.container = new THREE.Object3D;

    plane.renderOrder = -999;

    container.add(plane);
    this.add(container);
  }

  update(data) {
    if (!this.needsUpdate) return;

    this.updatePosition(data);

    this.needsUpdate = false;
  }

  updatePosition({camera}) {

    const {plane: {material: {map}}, plane, container} = this;
    const vector = new THREE.Vector3();
    const zNearPlane = -1;

    const w = map?.image?.width || 1;
    const h = map?.image?.height || 1;

    const aspect = w / h;

    camera.add(this);

    camera.near = 0.01;
    camera.updateMatrixWorld(true);
    const tl = vector.set(-1, 1, zNearPlane).applyMatrix4(camera.projectionMatrixInverse.clone()).clone();
    const br = vector.set(1, -1, zNearPlane).applyMatrix4(camera.projectionMatrixInverse.clone()).clone();

    const height = Math.abs(br.y - tl.y);
    const width = Math.abs(br.x - tl.x);

    const size = Math.max(height, width / aspect);
    const position = (new THREE.Vector3()).setFromMatrixPosition(camera.matrixWorld.clone());

    container.position.set(
      tl.x + (br.x - tl.x) / 2,
      tl.y + (br.y - tl.y) / 2,
      tl.z + (br.z - tl.z) / 2,
    );

    plane.position.set(0, (height - size) / 2, 0)

    container.updateMatrixWorld(true);
    container.lookAt(position.x, position.y, position.z);

    plane.scale.set(size * aspect, size, 1);
  }
}
