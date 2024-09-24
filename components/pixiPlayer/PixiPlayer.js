import React, {useReducer, useRef} from "react";
import {useUnpackLibrary} from "../../hooks/useUnpackLibrary";
import {useSceneCreator} from "../../hooks/useSceneCreator";
import classNames from "classnames";
import {Scrollbars} from "react-custom-scrollbars-2";
import {pixiLayer} from "../../constants/copyright";
import {ChromePicker} from "react-color";

const initialState = {
  file: null,
  wrapper: null,
  active: null,
  isPaused: false,
  scale: 1,
  isHelpers: true,
  color: "#ff0000",
  helpersColor: "#000000",
  activeColor: "canvas"
};

const reducerLogic = {
  setFile: payload => ({file: payload}),
  setWrapper: payload => ({wrapper: payload}),
  setActive: payload => ({active: payload}),
  setIsPaused: payload => ({isPaused: payload}),
  setScale: payload => ({scale: payload}),
  setIsHelpers: payload => ({isHelpers: payload}),
  setActiveColor: payload => ({activeColor: payload}),
  setColor: payload => ({color: payload}),
  setHelpersColor: payload => ({helpersColor: payload})
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

  const setColor = (data) => {
    state.wrapper.setColor(data.hex);
  };

  const setHelpersColor = (data) => {
    state.wrapper.setHelpersColor(data.hex);
  };

  const setActiveColor = payload => {
    reducerFunc({type: "setActiveColor", payload});
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
            Архив сюды давай
            <div className={"pixi-player__tutorial-text"}>архив .zip</div>
          </div>
        </>}
      </div>
      {!!state.wrapper &&
        <div className={"pixi-player__library"}>
          <Scrollbars
            className={"pixi-player__library-scrollbar"}
            {...scrollbar}
          >{Object.entries(state.wrapper.getLib() ?? {}).map(([key, Class]) => {
            const isMovieClip = Class.prototype instanceof PIXI.animate.MovieClip;
            const isActive = state.active?.name === key;
            return (
              <div
                key={key}
                className={classNames("pixi-player__library-item", {
                  "pixi-player__library-item_active": isActive
                })}
                onClick={() => setActive(key)}
              >
                <div className={"pixi-player__library-item-text"}>{key}</div>
                {isMovieClip && isActive && <div className={"pixi-player__library-item-controls"}>
                  <div className={"pixi-player__library-item-pause"} onClick={setIsPaused}>
                    {!state.isPaused ? "Пауз." : "Проигр."}
                  </div>
                </div>}
              </div>
            );
          })}
          </Scrollbars>
          <div className={"pixi-player__tumblers"}>
            <div onClick={setIsHelpers} className={"pixi-player__tumblers-item"}>
              <div className={"pixi-player__tumblers-name"}>Helpers</div>
              <div className={"pixi-player__tumblers-switch"}>{state.isHelpers ? "Вкл." : "Выкл."}</div>
            </div>
            <div className={"pixi-player__tumblers-item"}>
              <div className={"pixi-player__color-toggle"}>
                <div className={"pixi-player__color-name"}
                     onClick={() => setActiveColor("canvas")}>scene
                </div>
                <div className={"pixi-player__color-name"}
                     onClick={() => setActiveColor("helpers")}>helpers
                </div>
              </div>
              <ChromePicker
                color={state[state.activeColor === "canvas" ? "color" : "helpersColor"]}
                onChange={state.activeColor === "canvas" ? setColor : setHelpersColor}
                disableAlpha={true}
              />
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default PixiPlayer;
