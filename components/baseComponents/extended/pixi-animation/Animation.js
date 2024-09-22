import React, {useEffect, useRef} from "react";
import {v4 as uuidv4} from 'uuid';
import {basePixiImports} from "../../utils/scene/utils/import/import-pixi";
import {combineRefs} from "../../../../utils/element/applyRef";


/**
 * requires scene-template
 */

const Animation = React.forwardRef(
  function Animation({instanceID, settings, data, onInit, style}, ref) {
    const containerRef = useRef();
    let instance;

    let isUnmounted = false;

    useEffect(() => {
      const uuid = uuidv4();
      (async function () {
        await basePixiImports();
        const {default: loader} = await import("./src/ComponentsLoader");
        await loader.load(settings.preload);
        const {default: AnimationWrapper} = await import("./src/AnimationWrapper");
        instance = AnimationWrapper.getInstance(instanceID);

        if (!isUnmounted)
          instance.updateData({settings, container: containerRef.current, data, onInit, uuid});
      })();

      return () => {
        isUnmounted = true;
        instance?.unload(uuid);
      };
    }, [])

    return (
      <div className={"animation"} ref={combineRefs([ref, containerRef])} style={style}>
      </div>
    );
  });
export default Animation;
Animation.propTypes = {};

