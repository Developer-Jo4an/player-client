/* eslint-disable */
/**
 * возвращает случайное число >= min и < max
 * @param {number?} min
 * @param {number} max
 * @return {number}
 */
export function rand(min, max) {
  if (arguments.length === 1) {
    max = min;
    min = 0;
  }
  // return min + Math.random() * (max - min);
  return mix(min, max, Math.random());
}

/**
 * возвращает случайное целое число >= min и < max
 * @param {number?} min
 * @param {number} max
 * @return {number}
 */
export function randInteger(min, max) {
  return rand.apply(this, arguments) | 0;
}

/**
 * Возвращает случайный элемент массива
 * @param {Array} arr
 * @return {*}
 */
export function randFromArray(arr) {
  return arr[randInteger(arr.length)];
}

/**
 * Возвращает случайный элемент взвешенного массива, у каждого элемента должен быть параметр `weight`
 * вероятность выпадения конкретного элемента равен его весу разделенному на общий вес всех элементов
 * @param {{weight:number}[]} arr
 * @return {*}
 */
export function randFromWeightedArray(arr) {
  const { total, map } = arr.reduce(initWeights, { total: 0, map: [] });

  if (total === 0) {
    return randFromArray(arr);
  }

  const r = rand(total);
  let i = 0;
  while (r >= map[i]) {
    i++;
  }
  return arr[i];

  function initWeights(res, { weight }) {
    res.map.push((res.total += weight));
    return res;
  }
}

/**
 * Переставляет элементы массива в случайном порядке
 * @param {Array} arr
 * @return {Array}
 */
export function shuffleArray(arr) {
  const src = [...arr];
  const dst = [];
  while (src.length) {
    dst.push(src.splice(randInteger(src.length), 1)[0]);
  }
  return dst;
}

export function sign(val) {
  return val < 0 ? -1 : val > 0 ? 1 : 0;
}

export function randSign() {
  return -1 + 2 * (Math.random() * 2 | 0);
}

/**
 * Находит число между `v1` и `v2`
 * @param v1 {number}
 * @param v2 {number}
 * @param val {number}
 * @return {*}
 */
export function mix(v1, v2, val) {
  return v1 + (v2 - v1) * val;
}

export function mixObject(v1, v2, val, props) {
  (props || Object.keys(v1))
    .forEach(key => {
      v1[key] = mix(v1[key], v2[key], val);
    });
  return v1;
}

/* module.exports = {rand,
  randInteger,
  randFromArray,
  randFromWeightedArray,
  shuffleArray,
} */

/*
function testRandFromWeightedArray() {
  let input = [{weight: 10}, {weight: 10000}, {weight: 20000}, {weight: 30000}];
  let stat = new Map;
  input.forEach(key=>stat.set(key, 0));
  let length = input.reduce((v,{weight})=>v+weight, 0);
  console.log( length );
  for (let i = 0; i < length; i++) {
    let key = randFromWeightedArray(input);
    stat.set(key, stat.get(key) + 1);
  }
  input.forEach((key,i)=>console.log(i, key.weight, stat.get(key)));

  cb();
} */
