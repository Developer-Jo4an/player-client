import React from "react";

export default function isChildrenEqual(v0, ...v) {
  const _h = hash(v0);
  return v.every(v1 => hash(v1) === _h);

  function hash(child) {
    const value = React.Children.map(child, c => c.key).join(", ");
    return value;
  }
}
