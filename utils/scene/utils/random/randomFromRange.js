export function getRandomFromRange(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}


export function getRandomFromArray(list) {
  return list[Math.floor(Math.random() * list.length)];
}
