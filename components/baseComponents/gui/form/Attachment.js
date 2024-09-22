import React from "react";
import Button from "../button/Button";

export default function Attachment({remove, file}) {

  return (<Button close={true} onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    remove(e);
  }} text={file.name}/>)
}
