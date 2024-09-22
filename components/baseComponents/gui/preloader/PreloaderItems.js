import React from "react";
import PropTypes from "prop-types";

export default function PreloaderItems({total}) {
  const items = [];
  while (items.length < total) {
    items.push(<p key={items.length}/>)
  }

  return items;
}

PreloaderItems.propType = {
  imgAttr: PropTypes.number
};
