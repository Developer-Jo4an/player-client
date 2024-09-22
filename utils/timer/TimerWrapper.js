let count = 0;

const timers = {};

class Timer {

  _time = 0;

  _listeners = [];

  /**
   *
   * @param onTimeout
   * @param duration in ms
   * @param delta
   */
  constructor({onTimeout, duration = 0, delta = 1000} = {}) { //delta= 1ceк
    this.time = this.duration = duration;
    this._delta = duration ? Math.min(duration, delta) : delta;
    this._onTimeout = onTimeout;
    this._interval = setInterval(this.update, this._delta);
  }

  get time() {
    return this._time;
  }

  set time(value) {
    this._time = Math.max(0, value);

    this._listeners.forEach(listener => listener(this.time));
  }

  subscribe(listener) {
    const {_listeners} = this;
    if (typeof listener === "function" && !_listeners.includes(listener)) {
      _listeners.push(listener);
      listener(this.time);
    }
  }

  unsubscribe(listener) {
    const {_listeners} = this;
    if (_listeners.includes(listener) && _listeners.length)
      _listeners.splice(_listeners.indexOf(listener), 1);
  }

  update = () => {
    const {_delta, _onTimeout} = this;

    this.time -= _delta;


    if (!this.time)
      _onTimeout?.call(null);
  };

  start() {
    this._paused = false;
  }

  pause() {
    this._paused = true;
  }

  destroy() {
    clearInterval(this._interval);
  }

  get stringTime() {
    return msToTime(this.time);
  }
}

export function addTimer({duration, onTimeout} = {}) {
  const timer = new Timer({duration, onTimeout});
  timers[++count] = timer;
  return count;
}

export function getTimer(uuid) {
  return timers[uuid];
}

export function removeTimer(uuid) {
  const timer = timers[uuid];
  timer.destroy();
  delete timers[uuid];
}

export function timeToString(time) {
  const secondsTotal = Math.ceil(time / 1000);
  const minutes = Math.floor(secondsTotal / 60);
  const seconds = secondsTotal % 60;

  return `${String(minutes).padStart(2, '0')}мин. ${String(seconds).padStart(2, '0')}с.`;
}

function msToTime(s) {
  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const mins = s % 60;
  const hrs = (s - mins) / 60;
  let str = "";

  if (hrs)
    str = str.concat(`${String(hrs).padStart(2, '0')}:`);
  return str.concat(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
}
