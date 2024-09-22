import {getTimer} from "../utils/timer/TimerWrapper";
import {useEffect, useState} from "react";

export default function useTimerWrapper(uuid) {
  const timer = getTimer(uuid);
  const [time, setTime] = useState(timer?.time || 0);

  useEffect(() => {
    const callback = time => setTime(time)
    timer?.subscribe(callback)

    return () => timer?.unsubscribe(callback);
  }, [uuid])

  return {timer, time};
}


