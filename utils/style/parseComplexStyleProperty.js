export function parseComplexStyleProperty(str) {
  const regex = /(\w+)\((.+?)\)/g;
  const transform = {};
  let match = regex.exec(str);

  while (match) {
    transform[match[1]] = transform[match[1]]
      ? transform[match[1]].concat([match[2]])
      : [match[2]];
    match = regex.exec(str)
  }

  return transform;
}

export function joinComplexStyleProperty(obj, order) {
  let str = "";

  if (order) {
    order.forEach(prop => {
      const value = obj[prop];
      if (!value) return;
      str += ` ${prop}(${value})`
    });

    return str;
  }


  Object.entries(obj).forEach(([prop, values]) => {
      values.forEach(value => str += ` ${prop}(${value})`)
    });
  return str;
}
