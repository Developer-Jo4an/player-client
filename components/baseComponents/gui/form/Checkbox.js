import React from "react";
import LabelInput from "./LabelInput";

const Checkbox = React.forwardRef((props, ref) => {
  return <LabelInput type="checkbox" {...props} ref={ref}/>;
})

export default Checkbox;
