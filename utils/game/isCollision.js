function rotate(x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    x * cos - y * sin,
    x * sin + y * cos,
  ]
}

export default function isCollision({x, y, width, height, angle}, {x: bx, y: by}) {
  const [px, py] = rotate(bx - x, y - by, -angle);
  return Math.abs(px) < width * 0.5 && Math.abs(py) < height * 0.5;
}
