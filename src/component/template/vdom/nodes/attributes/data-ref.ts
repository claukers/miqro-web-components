import {get, getTemplateTokenValue, TemplateValues} from "../../../utils";
import {DATA_REF} from "./constants.js";
import {TemplateElementNode} from "../element.js";

export function dataRef(node: Node, values: TemplateValues, childElement: TemplateElementNode): void {
  const dataRefValue = (node as Element).getAttribute(DATA_REF);
  if (dataRefValue !== null) {
    const dataRefPath = getTemplateTokenValue(dataRefValue);
    const value = dataRefPath ? get(values, dataRefPath) : undefined;
    const callback = value && typeof value == "function" ? (value as Function).bind(values.this) : undefined;
    if (callback) {
      // callback(childElement);
      childElement.refListeners.push({listener: callback});
    } else {
      console.error("invalid value for %s [%s]=[%o] for [%o]", DATA_REF, dataRefValue, value, values.this);
      throw new Error(`invalid value for ${DATA_REF}`);
    }
  }
}
