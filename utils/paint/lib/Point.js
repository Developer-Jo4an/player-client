/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2019, Juerg Lehni & Jonathan Puckey
 * http://scratchdisk.com/ & https://puckey.studio/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

export default class Point {
  constructor(arg0, arg1) {
    const type = typeof arg0;
    const reading = this.__read;
    let read = 0;
    if (type === "number") {
      const hasY = typeof arg1 === "number";
      this._set(arg0, hasY ? arg1 : arg0);
      if (reading)
        read = hasY ? 2 : 1;
    } else if (type === "undefined" || arg0 === null) {
      this._set(0, 0);
      if (reading)
        read = arg0 === null ? 1 : 0;
    } else {
      const obj = type === "string" ? arg0.split(/[\s,]+/) || [] : arg0;
      read = 1;
      if (Array.isArray(obj)) {
        this._set(+obj[0], +(obj.length > 1 ? obj[1] : obj[0]));
      } else if ("x" in obj) {
        this._set(obj.x || 0, obj.y || 0);
      } else if ("width" in obj) {
        this._set(obj.width || 0, obj.height || 0);
      } else if ("angle" in obj) {
        this._set(obj.length || 0, 0);
        this.setAngle(obj.angle || 0);
      } else {
        this._set(0, 0);
        read = 0;
      }
    }
    if (reading)
      this.__read = read;
    return this;
  }

  static read(...args) {
    return args[0] instanceof Point ? args[0] : new Point(...args[0]);
  }

  _set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  equals(point) {
    return this === point || point
      && (this.x === point.x && this.y === point.y
        || Array.isArray(point)
        && this.x === point[0] && this.y === point[1])
      || false;
  }

  clone() {
    return new Point(this.x, this.y);
  }

  getLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  getDistance(...args) {
    const point = Point.read(args);
    const x = point.x - this.x;
    const y = point.y - this.y;
    const d = x * x + y * y;
    const squared = false;
    return squared ? d : Math.sqrt(d);
  }

  normalize(l) {
    let length = l;
    if (length === undefined) {
      length = 1;
    }
    const current = this.getLength();
    const scale = current !== 0 ? length / current : 0;
    const point = new Point(this.x * scale, this.y * scale);
    // Preserve angle.
    if (scale >= 0) {
      point._angle = this._angle;
    }
    return point;
  }

  add(...args) {
    const point = Point.read(args);
    return new Point(this.x + point.x, this.y + point.y);
  }

  subtract(...args) {
    const point = Point.read(args);
    return new Point(this.x - point.x, this.y - point.y);
  }

  multiply(...args) {
    const point = Point.read(args);
    return new Point(this.x * point.x, this.y * point.y);
  }

  negate() {
    return new Point(-this.x, -this.y);
  }

  dot(...args) {
    const point = Point.read(args);
    return this.x * point.x + this.y * point.y;
  }
}
