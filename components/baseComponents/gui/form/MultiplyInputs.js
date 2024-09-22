import React, {useCallback, useEffect, useRef, useState} from "react";
import Input from "../input/Input";

export default function MultiplyInputs({className, wrapper: Wrapper, name, maxItems = 10, ...etc}) {
  const counter = useRef(0);
  const [items, setItems] = useState([0]);

  const inputs = items.map((key, index) =>
    <Wrapper key={key} isRemove={index !== items.length - 1} {...etc} onChangeCount={() => {
      if (index === items.length - 1) {

        if (counter.current + 1 <= maxItems) {
          counter.current = items.length + 1;
          setItems([...items, counter.current]);
        }

      } else {
        items.splice(index, 1);
        counter.current = items.length - 1;
        setItems([...items]);
      }
    }}>
      <Input
        {...etc}
        name={`${name}[${index}]`}
        comp={className}/>
    </Wrapper>
  )
  return (
    <>
      {inputs}
    </>
  )
}
