import React from "react";
import parse from 'html-react-parser';

export function safeHTML(htmlString, key) {
  return htmlString && (
    <React.Fragment key={key}>
      {parse(htmlString.toString(), {
        replace(domNode) {
          const {name} = domNode;
          if (name === "script") return (<></>);
          return domNode;
        }
      })}
    </React.Fragment>
  );
}
