import React, {useRef} from "react";
import {useSceneCreator} from "../../hooks/useSceneCreator";
import classNames from "classnames";
import {Scrollbars} from "react-custom-scrollbars-2";
import {pixiLayer} from "../../constants/copyright";
import {ChromePicker} from "react-color";
import {FaPause, FaPlay} from "react-icons/fa";
import {usePixiPlayerContext} from "../../pages/PixiPlayerProvider";
import {usePlayerCallbacks} from "../../hooks/usePlayerCallbacks";
import Tumbler from "../tumbler/Tumbler";

const PixiPlayer = () => {
  const {state, reducerFunc} = usePixiPlayerContext();
  const {scrollbar} = pixiLayer;
  const sceneRef = useRef();

  const {
    onDrop,
    setActive,
    setIsPaused,
    setIsHelpers,
    setColor,
    setHelpersColor,
    setActiveLabel,
    setActiveColor
  } = usePlayerCallbacks();

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
            const isActiveMovieClip = isMovieClip && isActive;
            const labels = isActiveMovieClip ? state.active.labels : null;

            return (
              <div
                key={key}
                className={classNames("pixi-player__library-item", {"pixi-player__library-item_active": isActive})}
                onClick={() => setActive(key)}
              >
                <div className={"pixi-player__library-item-clip"}>
                  <div className={"pixi-player__library-item-name"}>{key}</div>
                  {isActiveMovieClip && <div
                    className={"pixi-player__library-item-pause"}
                    onClick={setIsPaused}
                  >{!state.isPaused ? <FaPause/> : <FaPlay/>}
                  </div>}
                </div>
                {isActiveMovieClip && !!labels?.length &&
                  <div className={"pixi-player__library-item-labels"}>
                    {labels
                    .filter(({label}) => !label.includes("_stop"))
                    .map(({label}) => {
                      return <div key={label} className={"pixi-player__library-item-label-item"}>
                        <div>{label}</div>
                        <Tumbler
                          width={30}
                          active={state.activeLabel === label}
                          onToggle={() => setActiveLabel(label)}
                        />
                      </div>;
                    })}
                  </div>}
              </div>
            );
          })}
          </Scrollbars>
          <div className={"pixi-player__tumblers"}>
            <div className={"pixi-player__tumblers_helpers"}>
              <div className={"pixi-player__tumblers-name"}>Helpers</div>
              <Tumbler width={40} active={state.isHelpers} onToggle={setIsHelpers}/>
            </div>
            <div className={"pixi-player__tumblers_helper-color helper-color"}>
              <div className={"helper-color__toggle-wrapper"}
                   onClick={() => setActiveColor(state.activeColor === "canvas" ? "helpers" : "canvas")}>
                <div className={classNames("helper-color__color-name", {
                  "helper-color__color-name_active": state.activeColor === "canvas"
                })}
                >Scene</div>
                <div className={classNames("helper-color__color-name", {
                  "helper-color__color-name_active": state.activeColor === "helpers"
                })}>Helpers</div>
                <div className={classNames("helper-color__toggle", {"helper-color__toggle_right": state.activeColor === "helpers"})}/>
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
