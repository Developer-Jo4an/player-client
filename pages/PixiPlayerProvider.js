import React, {createContext, useContext} from "react";

const PixiPlayerContext = createContext();

export const usePixiPlayerContext = () => useContext(PixiPlayerContext);

export const PixiPlayerProvider = ({children, value}) => (
  <PixiPlayerContext.Provider value={value}>
    {children}
  </PixiPlayerContext.Provider>
);
