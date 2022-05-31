import {get, getTemplateTokenValue, TemplateValues} from "../../../utils/index.js";
import {DATA_FOR_EACH, DATA_FOR_EACH_ITEM} from "./constants.js";
import {TemplateNode} from "../node.js";

export async function dataForEach(node: Node, values: TemplateValues, cb: (node: Node, values: TemplateValues) => Promise<TemplateNode | undefined>): Promise<TemplateNode[]> {
  const forEachValue = (node as Element).getAttribute(DATA_FOR_EACH);
  const forEachItemValue = (node as Element).getAttribute(DATA_FOR_EACH_ITEM);
  if (forEachValue !== null) {
    const ret = [];
    const forEachPath = getTemplateTokenValue(forEachValue);
    let value = forEachPath && get(values, forEachPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    if (forEachPath && value && value instanceof Array) {
      const vValues: any = {
        ...values
      };
      for (let index = 0; index < value.length; index++) {
        vValues[forEachItemValue !== null ? forEachItemValue : "item"] = value[index];
        vValues.index = index;
        const r = await cb(node, vValues);
        if (r) {
          ret.push(r);
        }
      }
      return ret;
    } else {
      console.error("invalid value for %s [%s]=[%o] for [%o]", DATA_FOR_EACH, forEachValue, value, values.this);
      throw new Error(`invalid value for ${DATA_FOR_EACH}`);
    }
  } else {
    const ret = await cb(node, values);
    return ret ? [ret] : [];
  }
}