import {usePixiPlayerContext} from "../pages/PixiPlayerProvider";
import {useUnpackLibrary} from "./useUnpackLibrary";

export const usePlayerCallbacks = () => {
  const {state, reducerFunc} = usePixiPlayerContext();
  const unpack = useUnpackLibrary();

  return {
    onDrop: async e => {
      const library = await unpack(e);
      reducerFunc({type: "setFile", payload: library});
    },
    setActive: key => key !== state.active?.name && state.wrapper.setActive(key),
    setIsPaused: () => state.wrapper.setIsPaused(),
    setIsHelpers: () => state.wrapper.setIsHelpers(),
    setColor: data => state.wrapper.setColor(data.hex),
    setHelpersColor: data => state.wrapper.setHelpersColor(data.hex),
    setActiveLabel: payload => state.wrapper.setActiveLabel(payload),
    setActiveColor: payload => reducerFunc({type: "setActiveColor", payload})
  };
};
