import React, {useCallback} from "react";
import * as PropTypes from "prop-types";
import classNames from "classnames";
import {useModal} from "../../../../hooks/useModal";

const animations = ["fade", "scale", "slide-right", "slide-in", "fall", "side-fall", "flip-horiz", "flip-vert", "super-scale", "rotate-left"];

export default function CustomModal(
  {
    children,
    animation = ["fade", "scale"],
    horizontalPosition = "center",
    verticalPosition = "center",
    className,
    isFullPage
  }
) {
  const {id, closeModal} = useModal();
  const close = useCallback(() => closeModal(id), [id]);
  return (
    <div
      className={classNames(
        "custom-modal",
        {"custom-modal_fullpage": isFullPage},
        animation,
        b(horizontalPosition),
        b(verticalPosition),
        className
      )}
    >
      <div className={"custom-modal__bg"}/>
      <div className={"custom-modal__block"}>
        <div className={"custom-modal__content"}>
          {
            typeof children === "function"
              ? children({id, close})
              : children
          }
        </div>
      </div>
    </div>
  )
}

function b(list) {
  if (!list) return list;
  if (typeof list === "string") list = list.split(" ");
  return list.map(mod => `custom-modal_${mod}`);
}

CustomModal.propTypes = {
  animation: PropTypes.oneOfType([
    PropTypes.oneOf(animations),
    PropTypes.arrayOf(PropTypes.oneOf(animations)),
    PropTypes.string,
  ]),
  isFullPage: PropTypes.bool,
  horizontalPosition: PropTypes.oneOf(["left", "right", "center"]),
  verticalPosition: PropTypes.oneOf(["top", "bottom", "center"]),
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
