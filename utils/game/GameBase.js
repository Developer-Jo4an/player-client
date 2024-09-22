import Ticker from "./Ticker";
import EventDispatcher from "./EventDispatcher";

export default class GameBase extends EventDispatcher {
  /**
   * @type {[GameBase]}
   */
  static instances = [];

  ticker;

  constructor(ticker = Ticker.shared) {
    super();
    GameBase.instances.push(this);
    this.onTick = this.onTick.bind(this);
    this.initTicker(ticker);
  }

  initTicker(ticker) {
    if (this.ticker) throw new Error("Ticker уже создан");
    this.ticker = ticker;
    this.ticker.on(Ticker.TICK, this.onTick);
  }

  toggleTicker(isActive) {
    if (!this.isStarted) return;
    if (isActive) this.ticker.start();
    else this.ticker.pause();
  }

  onTick(e) {}

  resize(boundingClientRect) {

  }

  start(isStarted) {
    if (this.isStarted === isStarted) return;
    this.isStarted = isStarted;
    // if (isStarted) this.ticker.start();
    // else this.ticker.pause();
  }

  getStat() {
    return {
      time: this.ticker.time
    }
  }

  setLevelInfo(levelInfo, shipId, ships) {

  }

  destroy() {
    this.ticker.off(Ticker.TICK, this.onTick);
    GameBase.instances.splice(GameBase.instances.indexOf(this), 1);
    if (GameBase.instances.length === 0) {
      this.ticker.stop();
    }
    this.ticker = undefined;
  }
}
