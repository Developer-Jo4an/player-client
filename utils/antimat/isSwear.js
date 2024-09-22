import Filter from "bad-words";
import {containsMat} from "./antimat";

const f = new Filter;

export default function isSwear(txt) {
  return f.isProfane(txt) || containsMat(txt);
}
