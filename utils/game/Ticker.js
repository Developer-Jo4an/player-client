import EventDispatcher from "./EventDispatcher";
import now from "../now";

const STOPPED = 1;
const STARTED = 2;
const PAUSED  = 3;

export default class Ticker extends EventDispatcher {
  static TICK = "tick";

  static START = "start";

  static PAUSE = "pause";

  static DONE = "done";

  #state = STOPPED;

  #time = 0;

  #prevTick = 0;

  #tickId = 0;

  #duration;

  static shared = new Ticker();

  constructor(duration) {
    super();
    this.#duration = duration;
  }

  #tick() {
    this.#delay();
    this.#update();
  }

  #delay() {
    cancelAnimationFrame(this.#tickId);
    this.#tickId = requestAnimationFrame(() => this.#tick());
  }

  #cancelDelay() {
    cancelAnimationFrame(this.#tickId);
    this.#tickId = 0;
  }

  #update() {
    const time = now();
    const dTime = Math.min(time - this.#prevTick, 100);
    this.#time += dTime;
    this.#prevTick = time;
    this.trigger({type: Ticker.TICK, time: this.time, delta: dTime, countdown: this.#duration - this.time});
    if (this.#duration > 0 && this.#time > this.#duration) {
      this.done("timeout");
    }
  }

  toggle(isActive) {
    if (isActive === true) {
      this.start();
    } else if (isActive === false) {
      this.pause();
    }
  }

  start() {
    if (this.#state === STARTED) return;
    this.#state = STARTED;
    this.trigger({type: Ticker.START, time: this.time});
    this.#prevTick = now();
    this.#tick();
  }

  pause() {
    if (this.#state !== STARTED) return;
    //TODO вернуть update, если будет использоватьсе setTimeout вместо requestAnimationFrame
    // this.#update();
    this.#state = PAUSED;
    this.#cancelDelay();
    this.trigger({type: Ticker.PAUSE, time: this.time});
  }

  stop() {
    this.pause();
    this.#state = STOPPED;
    this.#time = 0;
  }

  done(reason) {
    this.pause();
    this.trigger({type: Ticker.DONE, reason});
  }

  get time() {
    return this.#time;
  }

  destroy() {
    this.stop();
    super.destroy();
  }
}
