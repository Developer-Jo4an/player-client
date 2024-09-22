import useBridge from "./useBridge";
import CustomBridge from "../controllers/bridge/CustomBridge";

export default function useCustomBridge() {
  useBridge({
    authorization({data}) {
    }
  }, CustomBridge);

}
