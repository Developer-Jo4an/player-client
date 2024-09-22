import HowlerAdapter from "./HowlerAdapter";
import {fromTo, killTweensOf, to} from "./SimpleTween";
import {visibilityParameters} from "./visibilityChange";


class SoundManager {
  items = {};

  _ignoreSave = false; // флаг игнорирования сохранения выключения звука

  constructor({adapter}) {
    this.sounds = {};
    this.adapter = adapter;
    this._muted = undefined;
    this._mutedMusic = false;
    this._mutedSounds = false;
    this.visibilityData = visibilityParameters();
    try {
      this.muted = global?.window?.localStorage?.getItem("muted_state") === "true";
    } catch (e) {
      this.muted = false;
    }
    global?.window?.document.addEventListener(this.visibilityData.visibilityChange, this.handleVisibilityChange, false);
    global?.window?.addEventListener("beforeunload", this.onUnload, false);
  }

  load = ({name, path, data}) => {
    const loadData = {};
    loadData.promise = new Promise((resolve, reject) => {
      loadData.sound = this.adapter.load(name, path, data, resolve, reject);
    });
    this.items[name] = loadData;
    return this;
  };

  loadList(list) {
    return Promise.all(list.map(this.load));
  }

  handleVisibilityChange = () => {
    if (this._unload) return;
    const hidden = document[this.visibilityData.hidden];
    if (hidden) this._lastMute = this._muted;

    this._ignoreSave = true;
    this.muted = hidden ? hidden : this._lastMute;
  };

  onUnload = () => {
    this._unload = true;
  };


  set muted(muted) {
    if (this._muted === muted) return;
    const {adapter} = this;
    this.adapter.skipDispatch = true;
    this._muted = muted;
    killTweensOf(adapter);
    if (muted)
      this.prevVolume = adapter.volumeAll;
    if (muted)
      adapter.baseVolume = 0;
    else
      adapter.baseVolume = this.prevVolume || 1;

    if (this._ignoreSave) {
      this._ignoreSave = false;
      return;
    }
    try {
      global?.window?.localStorage.setItem("muted_state", muted.toString());
    } catch (e) {

    }
  }

  get muted() {
    return this._muted;
  }

  set mutedMusic(_mutedMusic) {
    if (this.mutedMusic === _mutedMusic) return;

    this._mutedMusic = _mutedMusic;

    Object.keys(this.sounds).forEach(key => {
      const sound = this.sounds[key];
      if (!sound.isBackground) return;
      to(sound, {volume: this.mutedMusic ? 0 : 1}, 1);
    });
  }

  get mutedMusic() {
    return this._mutedMusic;
  }

  set mutedSounds(_mutedSounds) {
    if (this.mutedSounds === _mutedSounds) return;

    this._mutedSounds = _mutedSounds;

    Object.keys(this.sounds).forEach(key => {
      const sound = this.sounds[key];
      if (sound.isBackground) return;
      to(sound, {volume: this.mutedMusic ? 0 : 1}, 1);
    });
  }

  get mutedSounds() {
    return this._mutedSounds;
  }

  addCallback(callback) {
    this.adapter.addCallback(callback);
  }

  deleteCallback(callback) {
    this.adapter.deleteCallback(callback);
  }

  onPlay(name, {parallel = true, animationStart, loop, volume = 1, isBackground, checkPlaying, checkPaused} = {}) {

    const current = this.sounds[name];

    if (loop) {
      this.backgroundSound = name;
    }

    if (
      checkPlaying && current &&
      !current.soundPaused && (checkPaused ? !current.paused : true) &&
      current.animation !== "fade_out"
    ) {
      return;
    }

    if (!parallel && current && !current.soundPaused) {
      this.pauseSound(name);
    }

    if (isBackground && this.mutedMusic) volume = 0;
    if (!isBackground && this.mutedSounds) volume = 0;

    this.sounds[name] = this.adapter.play(name, {loop, volume}, this.items);
    if (!this.sounds[name]) return null;
    this.sounds[name].soundPaused = false;
    this.sounds[name].isBackground = isBackground;
    if (animationStart)
      this.animate(name, this.sounds[name], animationStart, "in", {volume});

    return this.sounds[name];
  }

  pauseSound(name, id) {
    this.adapter.stop(name, id);
    this.sounds[name].soundPaused = true;
  }

  onPause(name, {animationEnd, id, duration} = {}) {
    const current = this.sounds[name];
    if (!current) return;
    if (animationEnd)
      this.animate(name, this.sounds[name], animationEnd, "out", {id, duration});
    else
      this.pauseSound(name, id);
  }

  set volume(value) {
    this.adapter.baseVolume = value;
  }

  get volume() {
    return this.adapter.volumeAll;
  }

  set skipDispatch(skipDispatch) {
    this.adapter.skipDispatch = skipDispatch;
  }

  animate(name, sound, animationType, animationDirection, options) {
    const animationFn = this[`${animationType}Animation`];

    if (typeof animationFn === "function")
      animationFn(name, sound, animationDirection, options);
  }

  fadeAnimation = (name, sound, direction, options = {}) => {
    killTweensOf(sound);

    sound.animation = `fade_${direction}`;
    if (direction === "in") {
      const volume = options.volume !== undefined ? options.volume : 1;
      sound.volume = 0;
      fromTo(sound, {volume: 0}, {volume}, options?.duration ?? 3);
    } else {
      to(sound, {volume: 0}, options?.duration ?? 0.5, () => this.pauseSound(name, options.id));
    }
  };
}

export const soundManager = new SoundManager({adapter: new HowlerAdapter()});
