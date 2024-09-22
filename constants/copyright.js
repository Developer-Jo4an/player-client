import React from "react";

export const pixiLayer = {
  scrollbar: {
    renderView: ({style, ...props}) => <div style={{
      ...style, width: "auto", backgroundColor: "#fff", display: "flex", flexDirection: "column"}} {...props} />,
    renderTrackHorizontal: ({style, ...props}) => <div
      style={{...style, height: "90%", top: "5%", right: "6px"}} {...props} />,
    renderTrackVertical: ({style, ...props}) => <div
      style={{...style, height: "90%", top: "5%", right: "6px"}} {...props} />,
    renderThumbHorizontal: ({style, ...props}) => <div
      style={{...style, backgroundColor: "#ff6600", borderRadius: "5px"}} {...props}/>,
    renderThumbVertical: ({style, ...props}) => <div
      style={{...style, backgroundColor: "#ff6600", borderRadius: "5px"}} {...props}/>,
  }
};

