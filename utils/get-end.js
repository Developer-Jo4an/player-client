/* eslint-disable */
export default function getEnd(val, ...args) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  args = args || [];
  val %= 100;
  if (Math.floor(val / 10) === 1) return isset(args[2]) ? args[2] : 2;
  if (val % 10 === 1) return isset(args[0]) ? args[0] : 0;
  if (val % 10 > 1 && val % 10 < 5) return isset(args[1]) ? args[1] : 1;

  return isset(args[2]) ? args[2] : 2;
}

function isset(val) {
  return typeof val !== "undefined";
}
