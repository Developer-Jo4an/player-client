import React, {useCallback, useState} from "react";
import LabelInput from "./LabelInput";
import {safeHTML} from "../../../../utils/safeHTML";

export default function FileInput({onFilesChanged, labelProps, ...props}) {
  const [isDragOver, setIsDragOver] = useState(true);

  return <LabelInput
    labelProps={{
      className: `file-input ${props.className ? props.className : ""}`,
      onDragExit: () => setIsDragOver(false),
      onDragEnter: () => setIsDragOver(true),
      ...labelProps
    }}

    type="file"
    {...props}
    onChange={(e) => {
      props.onChange?.(e);
      const correctFiles = Array.from(e.target.files).filter(file => props?.rules?.validate([file]) === true ?? true);
      onFilesChanged?.(correctFiles);
      if (!correctFiles.length) e.target.value = null
    }}
    style={{display: "none"}}
  >
    {props.image && <img src={props.image} className={"file-input__image"}/>}
    {props.text && <div className={"file-input__text"}>{safeHTML(props.text)}</div>}
  </LabelInput>;
}
