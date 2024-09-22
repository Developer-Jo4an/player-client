function getPosition(e) {
  const {clientX: x, clientY: y} = e.touches ? e.touches[0] : e;
  return {x, y};
}

const MOVE_ACTIVE = "drag-active";
const DROP = "drop";
const DROP_ACTIVE = "drop-active";

const INFINITY_BOUNDS = {left: -Infinity, right: Infinity, top: -Infinity, bottom: Infinity};
function getBounds(bounds, target) {
  if (!bounds) return INFINITY_BOUNDS;

  let _outerBounds = bounds.getBoundingClientRect();
  let _innerBounds = target.getBoundingClientRect();
  let left = _outerBounds.left - _innerBounds.left;
  let right = _outerBounds.right - _innerBounds.right;
  let top = _outerBounds.top - _innerBounds.top;
  let bottom = _outerBounds.bottom - _innerBounds.bottom;
  return {
    left: Math.min(left, right),
    right: Math.max(left, right),
    top: Math.min(top, bottom),
    bottom: Math.max(top, bottom),
  };
}

export default function dragAndDrop({target, props, onStartDrag, onDrag, onDrop, onDropReset, bounds, isResetOnDrop}) {
  let dragInfo = {};
  target.addEventListener("pointerdown", startDrag);
  target.style.touchAction = "none";
  let _bounds = INFINITY_BOUNDS;

  function startDrag(e) {
    // e.target.releasePointerCapture(e.pointerId);
    if (dragInfo.pointerId) return;

    global.addEventListener("pointermove", drag);
    global.addEventListener("pointerup", stopDrag);
    _bounds = getBounds(bounds, target);

    dragInfo.id = e.pointerId;
    dragInfo.startPosition = getPosition(e);
    dragInfo.startTransform = getComputedStyle(target).transform;
    if (dragInfo.startTransform === "none") {
      dragInfo.startTransform = "";
    }

    reset();
    target.classList.add(MOVE_ACTIVE);
    call(onStartDrag);
    drag(e);
  }

  function drag(e) {
    if (e.pointerId !== dragInfo.id) return;

    const currentPosition = getPosition(e);
    let dx = currentPosition.x - dragInfo.startPosition.x;
    let dy = currentPosition.y - dragInfo.startPosition.y;
    if (_bounds) {
      dx = Math.max(_bounds.left, Math.min(_bounds.right, dx));
      dy = Math.max(_bounds.top, Math.min(_bounds.bottom, dy));
    }

    dragInfo.position = {x: dx, y: dy};
    target.style.transform = `${dragInfo.startTransform} translate(${dx}px, ${dy}px)`;
    call(onDrag, {dx, dy});
  }

  function stopDrag(e) {
    if (e.pointerId !== dragInfo.id) return;
    _stopDrag();
  }

  function call(fn, info) {
    fn?.({...props, ...info, ...dragInfo, target}, self);
  }

  function _stopDrag() {
    global.removeEventListener("pointermove", drag);
    global.removeEventListener("pointerup", stopDrag);

    const {id} = dragInfo;
    delete dragInfo.id;
    delete dragInfo.start;
    // delete dragInfo.startTransform;
    if (!id) return;

    call(onDrop);
  }

  function reset() {
    target.classList.remove(MOVE_ACTIVE);
    target.classList.remove(DROP);
    target.classList.remove(DROP_ACTIVE);
    target.style.pointerEvents = "";
    target.style.transition = "";
    target.removeEventListener("transitionend", onTransitionEnd);
  }
  function onTransitionEnd() {
    reset();
    call(onDropReset);
  }

  const self = {
    destroy() {
      _stopDrag();
      reset();
      target.removeEventListener("pointerdown", startDrag);
    },
    reset() {
      _stopDrag(false);
      reset();
    },
    resetPosition(isAnimate = isResetOnDrop, transform = dragInfo.startTransform) {
      if (isAnimate) {
        // const {startTransform} = dragInfo;
        target.classList.add(DROP);
        target.style.pointerEvents = "none";
        target.scrollTop;
        target.classList.add(DROP_ACTIVE);
        target.style.transform = transform;
        target.addEventListener("transitionend", onTransitionEnd);
      } else {
        onTransitionEnd();
      }
    },
    stopDrag(isAnimate) {
      _stopDrag(isAnimate);
    },
    getRelativePosition() {
      let _outerBounds = bounds.getBoundingClientRect();
      let _innerBounds = target.getBoundingClientRect();
      const dx = (_outerBounds.width - _innerBounds.width);
      const dy = (_outerBounds.height - _innerBounds.height);
      return {
        x: (_innerBounds.left - _outerBounds.left) / dx || 0,
        y: (_innerBounds.top - _outerBounds.top) / dy || 0,
      }
    },
    setRelativePosition(x, y) {
      if (dragInfo.id) return;

      let _outerBounds = bounds.getBoundingClientRect();
      let _innerBounds = target.getBoundingClientRect();
      const dx = (_outerBounds.width - _innerBounds.width) * x;
      const dy = (_outerBounds.height - _innerBounds.height) * y;

      target.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  return self;
}
