/*
import {api} from "../../framework/api/api";
import {findGetParameter} from "../utils/utils";
import $ from "jquery";

export function getColors() {
  return [
    "#fffefd",
    "#2e4f8f",
    "#009ed5",
    "#ffef10",
    "#001773",
    "#312a5d",
    "#8cbd3a",
    "#f28f2c",
    "#e4322b",
    "#e4322b",
    "#2c2654",
    "#5aac3e",
    "#ec6d2d",
    "#b62e27",
    "#b62e27",
    "#231f42",
    "#009c40",
    "#e9592c",
    "#972b25",
    "#972b25"
  ].map(hex => ({id: hex}));
}

const $itemsPromise = api.send("/work/types")();
const dfdBg = $.Deferred();

export function getItemsData() {
  return $itemsPromise.then(({types}) => {
    return types;
  })
}

export function getCurrentItem() {
  return getItemsData().then((types) => {
    const type = types[Number(findGetParameter("editor-type")) || 0];
    dfdBg.resolve(type.backgrounds.map(i => ({image: i})));
    return type;
  });
}

export function getBackgrounds() {
  return dfdBg.promise();
}
*/


export const WIDTH = 1000;
export const HEIGHT = 1000;
export const SCALE = 2;
