import React, {useReducer, useRef} from "react";
import {useUnpackLibrary} from "../../hooks/useUnpackLibrary";
import {useSceneCreator} from "../../hooks/useSceneCreator";
import {FaFileArchive, FaPause, FaPlay} from "react-icons/fa";
import classNames from "classnames";
import {Scrollbars} from "react-custom-scrollbars-2";
import {pixiLayer} from "../../constants/copyright";

const initialState = {
  file: null,
  wrapper: null,
  active: null,
  isPaused: false,
  scale: 1,
  isHelpers: true
};

const reducerLogic = {
  setFile: payload => ({file: payload}),
  setWrapper: payload => ({wrapper: payload}),
  setActive: payload => ({active: payload}),
  setIsPaused: payload => ({isPaused: payload}),
  setScale: payload => ({scale: payload}),
  setIsHelpers: payload => ({isHelpers: payload}),
};

const reducer = (state, action) => {
  const {type, payload} = action;
  return {...state, ...reducerLogic[type](payload)};
};

const PixiPlayer = () => {
  const sceneRef = useRef();
  const unpack = useUnpackLibrary();
  const [state, reducerFunc] = useReducer(reducer, initialState, state => state);
  const {scrollbar} = pixiLayer;

  const onDrop = async e => {
    const library = await unpack(e);
    reducerFunc({type: "setFile", payload: library});
  };

  const setActive = key => {
    if (key === state.active?.name) return;
    state.wrapper.setActive(key);
  };

  const setIsPaused = () => {
    state.wrapper.setIsPaused();
  };

  const setIsHelpers = () => {
    state.wrapper.setIsHelpers();
  };

  useSceneCreator(state, reducerFunc, sceneRef);

  return (
    <div className={"pixi-player"}>
      <div className={classNames("pixi-player__drag-area", {
        "pixi-player__drag-area_active": !!state.wrapper
      })} ref={sceneRef}>
        {!!!state.wrapper && <>
          <label htmlFor={"archive"} className={"pixi-player__input-label"}>
            <input className={"pixi-player__input"} type={"file"} name={"archive"} onChange={onDrop}/>
          </label>
          <div className={"pixi-player__tutorial"}>
            <FaFileArchive size={32}/>
            <div className={"pixi-player__tutorial-text"}>архив .zip</div>
          </div>
        </>}
      </div>
      {!!state.wrapper &&
        <div className={"pixi-player__library"}>
          <Scrollbars
            className={"pixi-player__library-scrollbar"}
            {...scrollbar}
          >{Object.entries(state.wrapper.lib).map(([key, Class]) => {
            const isMovieClip = Class.prototype instanceof PIXI.animate.MovieClip;
            const isActive = state.active?.name === key;
            return (
              <div
                key={key}
                className={classNames("pixi-player__library-item", {
                  "pixi-player__library-item_active": isActive,
                })}
                onClick={() => setActive(key)}
              >
                <div className={"pixi-player__library-item-text"}>{key}</div>
                {isMovieClip && isActive && <div className={"pixi-player__library-item-controls"}>
                  <div className={"pixi-player__library-item-pause"} onClick={setIsPaused}>
                    {!state.isPaused ? <FaPause/> : <FaPlay/>}
                  </div>
                </div>}
              </div>
            );
          })}
          </Scrollbars>
          <div className={"pixi-player__tumblers"}>
            <div onClick={setIsHelpers}>{state?.isHelpers ? "Убрать" : "Включить"}</div>
          </div>
        </div>
      }
    </div>
  );
};

export default PixiPlayer;
