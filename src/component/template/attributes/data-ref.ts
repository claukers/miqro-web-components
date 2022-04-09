import {get, getTemplateTagPath} from "../utils.js";
import {DATA_REF} from "./constants.js";

export function dataRef(node: Node, values: any, childElement: HTMLElement): void {
  const dataRefValue = (node as Element).getAttribute(DATA_REF);
  if (dataRefValue !== null) {
    const dataRefPath = getTemplateTagPath(dataRefValue);
    const value = dataRefPath ? get(values, dataRefPath) : undefined;
    const callback = value && typeof value == "function" ? (value as Function).bind(values.this) : undefined;
    if (callback) {
      callback(childElement);
    } else {
      console.error("invalid value for %s [%s]=[%o] for [%o]", DATA_REF, dataRefValue, value, values.this);
      throw new Error(`invalid value for ${DATA_REF}`);
    }
  }
}
