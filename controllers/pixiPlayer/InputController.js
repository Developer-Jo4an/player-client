class InputController {
  constructor() {
    this.start = this.start.bind(this);
    this.move = this.move.bind(this);
    this.end = this.end.bind(this);
    this.wheel = this.wheel.bind(this);

    this.activePosition = null;
    this.isDragging = false;
    this.scale = 1;
    this.truthScale = 1;
  }

  init(eventBus, app, element, container) {
    this.element = element;
    this.app = app;
    this.eventBus = eventBus;
    this.container = container;
    this.truthScale = this.element.scale.x;

    this.element.interactive = true;
    this.element.cursor = "grab";

    this.element.on("mousedown", this.start);
    this.element.on("touchstart", this.start);

    this.element.on("touchmove", this.move);
    this.element.on("mousemove", this.move);

    this.element.on("touchend", this.end);
    this.element.on("touchendoutside", this.end);
    this.element.on("mouseup", this.end);
    this.element.on("mouseupoutside", this.end);

    this.app.view.addEventListener("wheel", this.wheel);
  }

  reset() {
    this.app.view.removeEventListener("wheel", this.wheel);
  }

  resize() {
    if (!this.element) return;
    const {width, height} = this.app.renderer;
    const {offsetWidth, offsetHeight} = this.container;
    const diff = ((offsetWidth + offsetHeight) - (width + height)) >= 0 ? "max" : "min";
    const scaleX = offsetWidth / width;
    const scaleY = offsetHeight / height;
    const scale = Math[diff](scaleX, scaleY);
    this.element.scale.set(this.element.scale.x * scale);
    this.truthScale = scale;
    this.element.position.set(this.element.position.x * scaleX, this.element.position.y * scaleY);
  }

  start({data}) {
    if (this.isDragging) return;
    this.activePosition = JSON.parse(JSON.stringify(data.global));
    this.isDragging = true;
  }

  move({data}) {
    if (!this.isDragging) return;
    const xDiff = data.global.x - this.activePosition.x;
    const yDiff = data.global.y - this.activePosition.y;
    this.activePosition = JSON.parse(JSON.stringify(data.global));
    this.element.position.set(this.element.position.x + xDiff, this.element.position.y + yDiff);
  }

  end() {
    if (!this.isDragging) return;
    this.activePosition = null;
    this.isDragging = false;
  }

  wheel(e) {
    e.preventDefault();
    const payload = e.deltaY > 0 ? -0.05 : 0.05;
    if (this.scale + payload <= 0) return;
    this.scale = this.scale + payload;
    this.scale > 0 && this.element.scale.set(this.scale * this.truthScale);
  }
}

export const inputController = new InputController();
