import React from "react";
import {node, array, string, object} from "prop-types";

const Select = React.forwardRef(({
                                   label,
                                   children,
                                   options,
                                   error,
                                   name,
                                   errorData,
                                   rules,
                                   onBlur,
                                   register,
                                   ...rest
                                 }, ref) => {
  const inputProps = rules ? register?.(name, rules) : register?.(name);
  const onChange = (e) => {
    inputProps?.onChange?.(e);
    rest?.onChange?.(e);
  };
  return (
    <label ref={ref}>
      {label ?? <span>{label}</span>}
      <select name={name}{...inputProps} onChange={onChange} {...rest}>
        {options.map((val) => {
          const {label, value} = init(val);
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
      {error}
      {children}
    </label>
  );
});

export default Select;


function init(value) {
  if (["string", "number", "boolean"].indexOf(typeof value) >= 0) {
    return {label: value, value};
  }
  return value;
}

Select.propTypes = {
  label: string,
  children: node,
  options: array,
  error: node,
  name: string,
};
