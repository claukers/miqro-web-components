import {get, getTemplateTagPath} from "../utils/index.js";
import {DATA_IF, DATA_IFN} from "./constants.js";

export function dataIfn(node: Element, values: any): boolean {
  const ifnValue = (node as Element).getAttribute(DATA_IFN);
  if (ifnValue !== null) {
    const ifnPath = getTemplateTagPath(ifnValue);
    if (!ifnPath) {
      console.error("invalid value for data-ifn [%s] for [%o]", ifnValue, values.this);
      throw new Error("invalid value for data-ifn");
    }
    let value = ifnPath && get(values, ifnPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    return !!!value;
  } else {
    return true;
  }
}

export function dataIf(node: Element, values: any): boolean {
  const ifValue = (node as Element).getAttribute(DATA_IF);
  if (ifValue !== null) {
    const ifPath = getTemplateTagPath(ifValue);
    if (!ifPath) {
      console.error("invalid value for data-if [%s] for [%o]", ifValue, values.this);
      throw new Error("invalid value for data-if");
    }
    let value = ifPath && get(values, ifPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    return !!value;
  } else {
    return true;
  }
}
