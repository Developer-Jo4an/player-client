/* eslint-disable prefer-destructuring */
import Point from "./Point";

export default class SegmentPoint {
  /**
   * @param {Point|array|{x: number, y:number}} point
   */
  constructor(point) {
    let x;
    let y;
    if (!point) {
      x = 0;
      y = 0;
    } else {
      x = point[0];
      if (x !== undefined) { // Array-like
        y = point[1];
      } else {
        // So we don't have to modify the point argument which would cause
        // deoptimization:
        let pt = point;
        // If not Point-like already, read Point from arguments
        x = pt.x;
        if (x === undefined) {
          pt = Point.read(point);
          x = pt.x;
        }
        y = pt.y;
      }
    }
    this._x = x;
    this._y = y;
  }

  set(p) {
    this._x = p.x;
    this._y = p.y;
    return this;
  }
}
