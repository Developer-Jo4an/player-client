class CSSMatrix {
  constructor() {}
}

const WebKitCSSMatrix = global.DOMMatrix || global.WebKitCSSMatrix || CSSMatrix;

const I = new WebKitCSSMatrix();

function Point(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Point.prototype.transformBy = function (matrix) {
  const tmp = matrix.multiply(I.translate(this.x, this.y, this.z));
  return new Point(tmp.m41, tmp.m42, tmp.m43);
};

export default function getTransformationMatrix(element1, element2) {
  const m0 = getElementTransformationMatrix(element1);
  const m1 = getElementTransformationMatrix(element2);
  return {
    m0, m1,
    forward: getTransform(m0, m1),
    backward: getTransform(m1, m0),
  }
}

function getTransform(m0, m1) {
  return m0.transformationMatrix.inverse()
    .translate(m1.dx - m0.dx,m1.dy - m0.dy, 0)
    .scale(m1.w / m0.w, m1.h / m0.h)
    .multiply(m1.transformationMatrix)
}

export function getElementTransformationMatrix(element) {
  let transformationMatrix = I;
  let x = element;

  while (typeof x !== "undefined" && x !== x.ownerDocument.documentElement) {
    const computedStyle = window.getComputedStyle(x, undefined);
    const transform = computedStyle.transform || "none";
    if (transform !== "none") {
      const c = new WebKitCSSMatrix(transform);
      transformationMatrix = c.multiply(transformationMatrix);
    }
    x = x.parentNode;
  }

  let {offsetWidth: w, offsetHeight: h} = element;

  const rect = element.getBoundingClientRect();
  const dx = window.pageXOffset + (rect.left + rect.right) * 0.5;
  const dy = window.pageYOffset + (rect.top + rect.bottom) * 0.5;

  return {
    dx, dy, w, h, transformationMatrix
  };
}
