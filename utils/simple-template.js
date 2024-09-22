function getValue(obj, key) {
  return key.split(".").reduce((res, key) => res?.[key], obj);
}

const functions = {
  simple: v => () => v,
  value: v => data => getValue(data, v),
  object: (key, objectStr) => {
    const o = JSON.parse(`{${objectStr}}`);
    return data => o[getValue(data, key)];
  }
}

/**
 * @param {string} string
 * @returns {function(*=): string}
 */
export default function simpleTemplate(string) {
  const regExp = /{{(.+?)}}/g;
  let execResult;
  let index = 0;
  const result = [];
  while (true) {
    execResult = regExp.exec(string);
    if (!execResult) break;
    const entrance = execResult[1];
    const from = execResult.index
    result.push(functions.simple(string.substring(index, from)))

    const arr = entrance.split(" ");
    let fn = functions.value;
    if (arr[0].charAt(0) === "#") {
      fn = functions[arr.shift().substr(1)] || functions.value;
    }

    result.push(fn(...arr));

    index = from + execResult[0].length;
  }
  result.push(functions.simple(string.substr(index)));

  return (data) => {
    return result.map(v => v(data)).join("");
  }
}
