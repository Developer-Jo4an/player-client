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

import Point from "./Point";
import SegmentPoint from "./SegmentPoint";

// eslint-disable max-classes-per-file


export default class Segment {
  _handleIn;

  _handleOut;

  constructor(arg0, arg1, arg2, arg3, arg4, arg5) {
    const count = arguments.length;
    let point;
    let handleIn;
    let handleOut;
    // TODO: Should we use Point.read() or Point.readNamed() to read these?
    if (count > 0) {
      if (arg0 == null || typeof arg0 === "object") {
        // Handle undefined, null and passed objects:
        if (count === 1 && arg0 && "point" in arg0) {
          // NOTE: This copies from segments through accessors.
          point = arg0.point;
          handleIn = arg0.handleIn;
          handleOut = arg0.handleOut;
        } else {
          // It doesn't matter if all of these arguments exist.
          // SegmentPoint() creates points with (0, 0) otherwise.
          point = arg0;
          handleIn = arg1;
          handleOut = arg2;
        }
      } else {
        // Read points from the arguments list as a row of numbers.
        point = [arg0, arg1];
        handleIn = arg2 !== undefined ? [arg2, arg3] : null;
        handleOut = arg4 !== undefined ? [arg4, arg5] : null;
      }
    }
    this._point = new SegmentPoint(point);
    this._handleIn = new SegmentPoint(handleIn);
    // if (this._handleIn  && (Math.abs(this._handleIn._x)  > 1000 || Math.abs(this._handleIn._y) > 1000) ||
    //     this._handleOut && (Math.abs(this._handleOut._x) > 1000 || Math.abs(this._handleOut._y) > 1000)){
    //   debugger;
    // }
    this._handleOut = new SegmentPoint(handleOut);
  }

  setHandleOut(...args) {
    this._handleOut.set(Point.read(args));
  }
}
