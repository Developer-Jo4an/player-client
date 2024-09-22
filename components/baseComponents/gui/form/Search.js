import React, {useEffect, useRef, useState, useTransition} from "react";
import {node, array, string, object} from "prop-types";
import LabelInput from "./LabelInput";
import {Scrollbar} from "react-scrollbars-custom";
import {safeHTML} from "../../../../utils/safeHTML";
import classNames from "classnames";
import {combineRefs} from "../../../../utils/element/applyRef";

const Search = React.forwardRef(({
                                   options,
                                   filter,
                                   className,
                                   ...rest
                                 }, ref) => {
  const inputRef = useRef();
  const searchRef = useRef();
  const [, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [opened, setOpened] = useState(false);

  const container = useRef();
  const onSelect = (value, label) => {
    const input = inputRef.current.querySelector("input")
    const searchInput = searchRef.current.querySelector("input");

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);
    nativeInputValueSetter.call(searchInput, "");

    searchInput.placeholder = label;

    input.dispatchEvent(new Event('input', {bubbles: true}));
    searchInput.dispatchEvent(new Event('input', {bubbles: true}));

    setOpened(false)
  };

  const filteredOptions = options.filter(filter ?? (({label}) => text ?
    label.toLowerCase().search(
      text.replace(new RegExp("\\\\", "g"), "\\\\").toLowerCase()) !== -1 : true));

  useEffect(() => {
    const searchInput = searchRef.current.querySelector("input");

    if (filteredOptions.length && !searchInput.placeholder) {
      searchInput.placeholder = filteredOptions[0].label;
    }
  }, [filteredOptions.length]);

  useEffect(() => {
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    }

    function onDown(e) {
      if (!container.current.contains(e.target))
        setOpened(false)
    }
  }, []);

  return (
    <div ref={combineRefs([ref, container])}
         className={classNames("search", className, opened && "search_active", options.length < 5 && "search_auto")}
    >
      <div className={"search__label"}>{rest.label}</div>
      <LabelInput name={`search`}
                  autoComplete={"off"}
                  labelProps={{ref: searchRef, className: "search__header"}}
                  onFocus={() => setOpened(true)}
                  onChange={(e) => startTransition(() => setText(e.target.value))}/>
      <LabelInput {...rest} labelProps={{ref: inputRef, style: {display: "none"}}}/>
      <div className={"search__list"}>
        <div className={"search__list-block"}>
          <Scrollbar
            style={{height: "100%"}}
            className={"scroll"}
          >
            <div className={"search__list-content"}>
              {filteredOptions.map(({label, value}) => (
                <div className={"search__item"} key={value} onClick={() => onSelect(value, label)}>
                  <div className={"search__item-text"}>{label}</div>
                </div>
              ))}
            </div>
          </Scrollbar>
        </div>
      </div>
    </div>
  );
});

export default Search;

Search.propTypes = {
  label: string,
  children: node,
  options: array,
  error: node,
  name: string,
};
