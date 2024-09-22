export function roundToDecimal(x, number = 2) {
  if (number < 0) return x;

  let delimiter = 10 ** number;

   return Math.round(x * delimiter) / delimiter;
}
