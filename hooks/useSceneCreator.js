import {useEffect} from "react";

export const useSceneCreator = (state, reducerFunc, ref) => {
  useEffect(() => {
    if (!state.file) return;
    (async () => {
      const {default: Wrapper} = await import("../controllers/pixiPlayer/Wrapper");
      const wrapper = new Wrapper(ref);
      wrapper.initController(state);
      reducerFunc({type: "setWrapper", payload: wrapper});
    })();
  }, [state.file]);

  useEffect(() => {
    const eventBus = state?.wrapper?.controller?.eventBus;

    if (!eventBus) return;

    const eventBusData = {
      "item:set-active": ({payload}) => reducerFunc({type: "setActive", payload}),
      "item:set-isPaused": ({payload}) => reducerFunc({type: "setIsPaused", payload}),
      "item:set-isHelpers": ({payload}) => reducerFunc({type: "setIsHelpers", payload}),
      "item:set-color": ({payload}) => reducerFunc({type: "setColor", payload}),
      "item:set-helpersColor": ({payload}) => reducerFunc({type: "setHelpersColor", payload}),
      "item:set-activeLabel": ({payload}) => reducerFunc({type: "setActiveLabel", payload}),
      "item:set-scale": ({payload}) => payload + state.scale > 0 && reducerFunc({
        type: "setScale",
        payload: payload + state.scale
      })
    };

    const eventBusSetter = func => {
      for (const key in eventBusData)
        eventBus[func](key, eventBusData[key]);
    };

    eventBusSetter("addEventListener");
    return () => eventBusSetter("removeEventListener");
  }, [state]);
};
