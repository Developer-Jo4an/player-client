import React, {useCallback, useEffect, useRef} from "react";
import {combineRefs} from "../../../../../utils/element/applyRef";

const GLVideoComponent = React.forwardRef(
  function GLVideoComponent({
                              attr,
                              src,
                              className,

                              delay = 0,
                              upscale = 1,
                              pauseOnEnd = true,
                              settings = {}
                            }, ref) {
    const containerRef = useRef();
    const videoRef = useRef();

    const onVideoEnd = useCallback(glvideo => glvideo?.pause(), []);

    useEffect(() => {

      let glvideo, timeout, isUnmounted = false;

      const video = videoRef.current;
      const container = containerRef.current;

      const onEnd = onVideoEnd.bind(null, glvideo);
      const resize = () => glvideo.resize();


      import("./GLVideo")
        .then(({default: GLVideo}) => {
          if (isUnmounted) return;

          timeout = setTimeout(() => {

            glvideo = new GLVideo(container, video, null, upscale);

            glvideo.play();
            glvideo.resize();

            if (pauseOnEnd)
              video.addEventListener("ended", onEnd);

            window.addEventListener("resize", resize);
          }, delay);
        });

      return () => {
        isUnmounted = true;
        glvideo?.pause();
        clearTimeout(timeout);
        window.removeEventListener("resize", resize);
        video.removeEventListener("ended", onEnd);
      };
    }, []);

    return (
      <div
        style={{width:"100vw", height:"50vw"}}
        ref={containerRef}
        className={className ? className : ""}
      >
        <video
          ref={combineRefs([ref, videoRef])}
          style={{display: "none"}}
          {...attr}
          src={src}
        />
      </div>
    );
  });
export default GLVideoComponent;
GLVideoComponent.propTypes = {};
