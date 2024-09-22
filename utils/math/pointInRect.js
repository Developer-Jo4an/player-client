export default function pointInRect(point, rect) {
  const {x, y} = point;
  const {x: leftX, y: leftY, width, height} = rect;

  return (
    x >= leftX &&
    x <= leftX + width &&
    y >= leftY &&
    y <= leftY + height
  );
}
