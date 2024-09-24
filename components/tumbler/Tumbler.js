import React from "react";
import classNames from "classnames";

const Tumbler = ({width, active, onToggle}) => {
  const size = width ?? 50;
  const height = size / 2.5;
  const circleSize = size / 3.125;

  return (
    <div
      className={classNames("tumbler", {"tumbler_active": !!active})}
      style={{width: size, height, borderRadius: height, borderWidth: height / 10, padding: width / 10}}
      onClick={onToggle}
    >
      <div className={"tumbler__wrapper"}>
        <div className={"tumbler__inner"} style={{width: circleSize, height: circleSize, borderWidth: height / 10}}/>
      </div>
    </div>
  );
};

export default Tumbler;
