import Bridge from "../controllers/bridge/Bridge";
import {useEffect} from "react";

export default function useBridge(reducer, BridgeCls = Bridge) {
  useEffect(() => {
    BridgeCls.instance.init(reducer);
  }, [])
}
