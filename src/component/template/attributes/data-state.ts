import {get, getTemplateTagPath, IComponent} from "../utils.js";
import {DATA_STATE} from "./constants.js";

export function dataState(node: Node, values: any, childElement: HTMLElement): void {
  const dataStateValue = (node as Element).getAttribute(DATA_STATE);
  if (dataStateValue !== null) {
    const dataStatePath = getTemplateTagPath(dataStateValue);
    let value = dataStatePath && get(values, dataStatePath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    if (dataStatePath && value && typeof value === "object") {
      const asComponent = (childElement as IComponent);
      if (asComponent && typeof asComponent.setState === "function") {
        asComponent.setState(value, false);
      } else {
        console.error("invalid value for data-state [%o] for [%o]", value, values.this);
        throw new Error(`invalid value for ${DATA_STATE}`);
      }
    } else {
      console.error("invalid value for data-state [%s]=[%o] for [%o]", dataStateValue, value, values.this);
      throw new Error(`invalid value for ${DATA_STATE}`);
    }
  }
}
