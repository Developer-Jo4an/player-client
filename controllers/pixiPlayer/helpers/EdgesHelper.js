export default class EdgesHelper {
  constructor(app) {
    this.app = app;
    this.helpers = {};
    this.generalColor = 0x000000;
    this.generalBorderWeight = 3;
    this.generalPivotWeight = 3;
    this.generalPivotLength = 10;
  }

  killHelper() {
    for (const ley in this.helpers) {
      const helper = this.helpers[ley];
      helper?.destroy?.();
    }

    this.helpers = {};
  }

  updateHelper(data) {
    this.killHelper();

    this.app.stage.children.forEach(element => {
      if (!element.isHelp) return;

      const {x, y, width, height} = element.getBounds();

      const borderWeight = data?.border?.weight ?? this.generalBorderWeight;
      const borderColor = data?.border?.color ?? data?.mainColor ?? this.generalColor;
      const border = this.helpers.border = new PIXI.Graphics();
      border
      .lineStyle(borderWeight, borderColor)
      .drawRect(x, y, width, height);

      const pivotWeight = data?.pivot?.weight ?? this.generalPivotWeight;
      const pivotColor = data?.pivot?.color ?? data?.mainColor ?? this.generalColor;
      const pivotLength = data?.pivot?.length ?? this.generalPivotLength;
      const pivot = this.helpers.pivot = new PIXI.Graphics();
      pivot
      .lineStyle(pivotWeight, pivotColor)
      .moveTo(x + width / 2 - pivotLength, y + height / 2)
      .lineTo(x + width / 2 + pivotLength, y + height / 2)
      .moveTo(x + width / 2, y + height / 2 - pivotLength)
      .lineTo(x + width / 2, y + height / 2 + pivotLength)
      .beginFill();

      this.app.stage.addChild(border);
      this.app.stage.addChild(pivot);
    });
  }
}
