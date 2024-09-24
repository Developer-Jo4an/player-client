import React, {useReducer} from "react";
import PageDescription from "../components/baseComponents/head/pageDescription/PageDescription";
import defaultPage from "../constants/page-description";
import PixiPlayer from "../components/pixiPlayer/PixiPlayer";
import {PixiPlayerProvider} from "./PixiPlayerProvider";

const initialState = {
  file: null,
  wrapper: null,
  active: null,
  isPaused: false,
  scale: 1,
  isHelpers: true,
  color: "#ff0000",
  helpersColor: "#000000",
  activeColor: "canvas",
  activeLabel: null
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
  setHelpersColor: payload => ({helpersColor: payload}),
  setActiveLabel: payload => ({activeLabel: payload})
};

const reducer = (state, action) => {
  const {type, payload} = action;
  return {...state, ...reducerLogic[type](payload)};
};

export default function Home() {
  const [state, reducerFunc] = useReducer(reducer, initialState);

  return (
    <PixiPlayerProvider value={{state, reducerFunc}}>
      <div className="container">
        <PageDescription {...defaultPage} />
        <PixiPlayer/>
      </div>
    </PixiPlayerProvider>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
