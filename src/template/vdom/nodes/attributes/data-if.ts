import {getTemplateTokenValue, } from "../../../utils/index.js";
import {DATA_IF, DATA_IFN} from "./constants.js";
import {log, LOG_LEVEL, TemplateValues, get} from "../../../../common/index.js";

export function dataIfn(node: Element, values: TemplateValues): boolean {
  const ifnValue = (node as Element).getAttribute(DATA_IFN);
  if (ifnValue !== null) {
    const ifnPath = getTemplateTokenValue(ifnValue);
    if (!ifnPath) {
      log(LOG_LEVEL.error, "invalid value for %s [%s] for [%o]", DATA_IFN, ifnValue, values.this);
      throw new Error(`invalid value for ${DATA_IFN}`);
    }
    let value = ifnPath && get(values, ifnPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    return !!!value;
  } else {
    return true;
  }
}

export function dataIf(node: Element, values: TemplateValues): boolean {
  const ifValue = (node as Element).getAttribute(DATA_IF);
  if (ifValue !== null) {
    const ifPath = getTemplateTokenValue(ifValue);
    if (!ifPath) {
      log(LOG_LEVEL.error, "invalid value for %s [%s] for [%o]", DATA_IF, ifValue, values.this);
      throw new Error(`invalid value for ${DATA_IF}`);
    }
    let value = ifPath && get(values, ifPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    return !!value;
  } else {
    return true;
  }
}
