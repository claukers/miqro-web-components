import {get, getTemplateTagPath} from "../utils.js";
import {DATA_FOR_EACH, DATA_FOR_EACH_ITEM} from "./constants.js";

export function dataForEach(node: Node, values: any, cb: (node: Node, values: any) => HTMLElement | undefined): HTMLElement[] {
  const forEachValue = (node as Element).getAttribute(DATA_FOR_EACH);
  const forEachItemValue = (node as Element).getAttribute(DATA_FOR_EACH_ITEM);
  if (forEachValue !== null) {
    const ret = [];
    const forEachPath = getTemplateTagPath(forEachValue);
    let value = forEachPath && get(values, forEachPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    if (forEachPath && value && value instanceof Array) {
      const vValues: any = {
        ...values
      };
      for (let index = 0; index < value.length; index++) {
        vValues[forEachItemValue !== null ? forEachItemValue : "item"] = value[index];
        vValues.index = index;
        const r = cb(node, vValues);
        if (r) {
          ret.push(r);
        }
      }
      return ret;
    } else {
      console.error("invalid value for data-for-each [%s]=[%o] for [%o]", forEachValue, value, values.this);
      throw new Error(`invalid value for ${DATA_FOR_EACH}`);
    }
  } else {
    const ret = cb(node, values);
    return ret ? [ret] : [];
  }
}
