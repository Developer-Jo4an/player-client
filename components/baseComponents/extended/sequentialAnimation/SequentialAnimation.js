import React, { useEffect, useMemo, useRef} from "react";

const SequentialAnimation = React.forwardRef(
  function SequentialAnimation({
                                 imagesData, width, height,
                                 fps = 60, onEndAnimation,
                                 loop = false,total,onUpdate
                               }, ref) {
    const canvasRef = useRef();

    const imagesInfo = useMemo(() => ({imagesData, index: 0}), []);
    const ticksData = useMemo(() => ({ticksToNextFrame: 60 / fps, totalTicks: 0}), []);

    imagesInfo.imagesData = imagesData;


    useEffect(() => {
      let isUnmounted = false;

      function update() {
        if (isUnmounted) return;

        ticksData.totalTicks++;

        if (ticksData.totalTicks % ticksData.ticksToNextFrame !== 0) {
          requestAnimationFrame(update);
          return;
        }

        const currentImage = imagesInfo.imagesData.find(({id}) => imagesInfo.index + 1 === id)?.image;

        if (!currentImage) return requestAnimationFrame(update);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImage, canvas.width / 2 - currentImage.width / 2,
          canvas.height / 2 - currentImage.height / 2);

        if (imagesInfo.index === imagesData.length - 1) {
          onEndAnimation?.call(null);
          if (!loop) return;
          imagesInfo.index = 0;
        }

        imagesInfo.index++;

        onUpdate?.(Math.round((imagesInfo.index/total) * 100))

        requestAnimationFrame(update);
      }

      update();

      return () => {
        isUnmounted = true;
      }
    }, []);

    return (
      <canvas
        width={width}
        height={height}
        ref={canvasRef}
        style={{
          width: "100%"
        }}
      />
    );
  });
export default SequentialAnimation;
SequentialAnimation.propTypes = {};

