import {useCallback, useEffect, useState} from "react";

export default function useTimer(total = 10_000, onTimeout, settings = {}) {
  const [time, setTime] = useState(total);
  const [timeoutID, setTimeoutID] = useState(null);
  const [paused, setPaused] = useState(true);

  const pause = useCallback(() => setPaused(true), [setPaused]);
  const resume = useCallback(() => setPaused(false), [setPaused]);

  const start = useCallback(() => {
    setPaused(false);
    setTime(total);

  }, [setPaused, setTime, total]);

  const reset = useCallback(() => {
    setPaused(true);
    setTime(total);
  }, [setTime, total]);

  useEffect(() => {
    setPaused(true);
    setTime(total);
  }, [total]);

  useEffect(() => {
    if (paused)
      clearTimeout(timeoutID)
  }, [paused]);

  useEffect(() => {
    if (!paused) {
      setTimeoutID((timeoutID) => {
        clearTimeout(timeoutID);
        return setTimeout(() => setTime(typeof settings.timeModifier === "function" ? settings.timeModifier(time, 1_000) : time - 1_000), 1_000);
      });
    }
  }, [time, paused]);


  useEffect(() => {
    if (!paused && time <= 0) {
      setPaused(true);
      if (typeof onTimeout === "function")
        onTimeout();
    }
  }, [time]);

  return [time, {pause, resume, start, reset, timeToString: () => timeToString(time)}];
}

function timeToString(time) {
  const secondsTotal = Math.floor(time / 1000);
  const minutes = Math.floor(secondsTotal / 60);
  const seconds = secondsTotal % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
