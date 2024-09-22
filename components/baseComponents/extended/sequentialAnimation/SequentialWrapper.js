import React, {useEffect, useMemo, useState} from "react";
import SequentialAnimation from "./SequentialAnimation";
import SequenceStorage from "./sequenceStorage";

function SequentialWrapper({
                             totalFrames,
                             onLoad,
                             onUpdate,
                             parallelLoading = false,
                             path = "images/sequence",
                             commonName = "",
                             loop = true,
                             width = 500,
                             height = 500
                           }) {
  const [imagesData, setImagesData] = useState([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if ((parallelLoading || imagesData.length === totalFrames) && !loadedRef.current) {
      loadedRef.current = true;
      onLoad?.();
    }
  }, [imagesData])

  const memoData = useMemo(() => ({
    isUnmounted: false,
    callbackOnImageLoad(data) {
      if (!this.isUnmounted)
        setImagesData((prevState) => [...prevState, data].sort((a, b) => a.id - b.id))
    },
    onUnmount() {
      this.isUnmounted = true;
    }
  }), []);

  const image = useMemo(() => {
    const url = getName(1);
    SequenceStorage
      .instance
      .loadByName({url, id: 1})
      .then(data => memoData.callbackOnImageLoad(data));
    return <img className={"sequential__stub"} src={url}/>
  }, [])

  function getName(id) {
    const src = `${path}${commonName}`;
    let idStr = `${id}`.padStart(4, "0");
    return `${src}${idStr}.png`;
  }

  useEffect(() => {
    for (let i = 2; i <= totalFrames; i++)
      SequenceStorage
        .instance
        .loadByName({url: getName(i), id: i})
        .then(data => memoData.callbackOnImageLoad(data))


    return () => {
      memoData.onUnmount()
    }
  }, []);

  return (
    imagesData.length === totalFrames || parallelLoading ?
      <SequentialAnimation
        width={width}
        height={height}
        imagesData={imagesData}
        fps={20}
        loop={loop}
        total={totalFrames}
        onUpdate={onUpdate}
      /> :
      image
  )
}

export default SequentialWrapper;
SequentialWrapper.propTypes = {};


