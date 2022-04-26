import {get, getTemplateTokenValue, IComponent, TemplateValues} from "../utils";
import {DATA_STATE} from "./constants.js";

export function dataState(node: Node, values: TemplateValues, childElement: HTMLElement): void {
  const dataStateValue = (node as Element).getAttribute(DATA_STATE);
  if (dataStateValue !== null) {
    const dataStatePath = getTemplateTokenValue(dataStateValue);
    let value = dataStatePath && get(values, dataStatePath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    if (dataStatePath && value && typeof value === "object") {
      const asComponent = (childElement as IComponent);
      if (asComponent && typeof asComponent.setState === "function") {
        asComponent.setState(value, undefined, false);
      } else {
        console.error("invalid value for %s [%o] for [%o]", DATA_STATE, value, values.this);
        throw new Error(`invalid value for ${DATA_STATE}`);
      }
    } else {
      console.error("invalid value for %s [%s]=[%o] for [%o]", DATA_STATE, dataStateValue, value, values.this);
      throw new Error(`invalid value for ${DATA_STATE}`);
    }
  }
}
