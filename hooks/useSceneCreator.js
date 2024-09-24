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

    eventBus?.addEventListener("item:set-scale", ({payload}) => {
      if (payload + state.scale <= 0) return;
      reducerFunc({type: "setScale", payload: payload + state.scale});
    });

    eventBus.addEventListener("item:set-active", ({payload}) => {
      reducerFunc({type: "setActive", payload});
    });

    eventBus.addEventListener("item:set-isPaused", ({payload}) => {
      reducerFunc({type: "setIsPaused", payload});
    });

    eventBus.addEventListener("item:set-isHelpers", ({payload}) => {
      reducerFunc({type: "setIsHelpers", payload});
    });

    eventBus.addEventListener("item:set-color", ({payload}) => {
      reducerFunc({type: "setColor", payload});
    });

    eventBus.addEventListener("item:set-helpersColor", ({payload}) => {
      reducerFunc({type: "setHelpersColor", payload});
    });
  }, [state]);
};
