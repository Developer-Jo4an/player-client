/* eslint-disable */
const parse = (function() {
  const HEX = _parse(/#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, 16);
  const RGB = _parse(/rgba?\((\d+),(\d+),(\d+)(?:,(\d+))?\)/, 10);
  const DIG = val => {
    return { r: (val >> 16) & 0xff, g: (val >> 8) & 0xff, b: val & 0xff };
  };
  const SIMPLE = val =>
    ["r", "g", "b"].every(c => val.hasOwnProperty(c)) ? val : undefined;
  const ARRAY = val =>
    Array.isArray(val) && {
      r: val[0],
      g: val[1],
      b: val[2],
      a: val.length > 3 ? val[3] : 1
    };

  function _parse(reg, radix) {
    return str => {
      let _exec = reg.exec(str);
      let res;
      if (_exec) {
        _exec = _exec.slice(1).map(str => parseInt(str, radix));
        res = {
          r: _exec.shift(),
          g: _exec.shift(),
          b: _exec.shift(),
          a: _exec.length ? _exec.shift() : 1
        };
      }

      return res;
    };
  }

  return val => {
    return ARRAY(val) || SIMPLE(val) || HEX(val) || RGB(val) || DIG(val);
  };
})();

export class Color {
  r = 0;

  g = 0;

  b = 0;

  a = 1;

  constructor(val) {
    const c = parse(val);
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
    this.a = typeof c.a === "number" ? c.a : 1;
  }

  static mix(c1, c2, val) {
    c1 = new Color(c1);
    c2 = new Color(c2);

    const res = ["r", "g", "b", "a"].map(c =>
      Math.round(c1[c] + (c2[c] - c1[c]) * val)
    );

    return new Color(res);
  }

  mix(c, val) {
    return Color.mix(this, c, val);
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}
