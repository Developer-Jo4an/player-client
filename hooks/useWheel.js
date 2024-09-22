import {useEffect, useRef} from "react";

export default function useWheel(onWheel) {
  const ref = useRef(global.document?.documentElement);

  useEffect(initMouseWheel, []);
  useEffect(() => {
    if (!ref.current) return ;

    const {current} = ref;
    current.addEventListener("pep:wheel", onWheel);
    return () => current.removeEventListener("pep:wheel", onWheel);
  }, [onWheel]);

  return ref;
}

// initMouseWheel(function(direction, count) {
//   $("#output4").text(direction === 1 ? "вниз" : "вверх");
//   $("#output5").text(count);
// });

let isInitialized;
export function initMouseWheel(target = global.document.documentElement) {
  if (isInitialized) {
    return;
  }
  isInitialized = true;
  let prev_time = 0;
  let prev_deltaY = 0;
  let prev_deltaY_abs = 0;
  let prev_direction = 0;
  let max_deltaY = 0;
  let max_deltaY_time = 0;

  let max_complete_timeout_delay = 200;
  let normal_timeout = 0;
  let complete_timeout;
  let wait_for_deacy_timeout;
  let event_count = 0;

  let current_direction = 0;
  let dispatcher;

  console.log("initMouseWheel");
  target.addEventListener("wheel", onWheel, {passive: true});
  target.addEventListener("mousewheel", onWheel, {passive: true});

  return () => {
    console.log("initMouseWheel destroy");
    target.removeEventListener("wheel", onWheel);
    target.removeEventListener("mousewheel", onWheel);
    isInitialized = false;
  };

  function onWheel(e) {
    let _deltaY = e.deltaY == undefined
      ? -e.wheelDelta
      : e.deltaY;
    let _deltaY_abs = Math.abs(_deltaY);
    let _direction = (current_direction = _deltaY > 0 ? 1 : -1);
    let _time = Date.now();
    let _delta_time = _time - prev_time;

    if (!dispatcher) {
      dispatcher = e.target;
    }

    if (max_deltaY === 0) {
      // пик не достигнут

      clearTimeout(normal_timeout);
      normal_timeout = setTimeout(onNormalTimeout, max_complete_timeout_delay);

      if (_deltaY_abs < prev_deltaY_abs) {
        // достигли пика - записали его значение
        // $("#output2").text( "max of scroll reached" );
        max_deltaY = prev_deltaY_abs;
        max_deltaY_time = _time;
        onMouseWheelComplete(_direction);
      }
    } else {
      // если пик достигнут то ждем...

      clearTimeout(normal_timeout);

      if (_deltaY_abs > prev_deltaY_abs + 3 && _time - max_deltaY_time > 200) {
        // ... наростания в случае повторного скролла но не чаще 200мсек...
        max_deltaY = 0;
      }

      clearTimeout(wait_for_deacy_timeout);
      wait_for_deacy_timeout = setTimeout(
        onWaitForDecay,
        max_complete_timeout_delay
      );
    }
    // }

    // ordinary mouse wheel

    prev_direction = _direction;
    prev_deltaY_abs = _deltaY_abs;
    prev_time = _time;
  }

  function onNormalTimeout() {
    onWaitForDecay();
    onMouseWheelComplete();
  }

  function onTimeout() {
    clearTimeout(complete_timeout);
    complete_timeout = 0;
    let last_event_time = Date.now() - prev_time;
  }

  function onWaitForDecay() {
    prev_deltaY = 0;
    max_deltaY = 0;
    prev_direction = 0;
  }

  function onMouseWheelComplete() {
    event_count++;
    if (dispatcher) {
      const event = new Event("pep:wheel", {bubbles: true, cancelable: true});
      event.direction = current_direction;
      event.count = event_count;
      dispatcher.dispatchEvent(event);
    }
    dispatcher = undefined;
  }
}
