import {LoadersManager} from "../LoadersManager";
import JSONLoader from "./JSONLoader";
import SVGLoader from "./SVGLoader";

export class BaseManager extends LoadersManager {

  getLoader({type}) {
    switch (type) {
      case "json":
        return JSONLoader;
      case "svg":
        return SVGLoader;
    }
  }
}

export const baseManager = new BaseManager();
