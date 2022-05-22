import {get, getTemplateTokenValue, TemplateValues} from "../../../utils";
import {DATA_STATE} from "./constants.js";
import {TemplateElementNode} from "../element.js";


export function dataState(node: Node, values: TemplateValues, childElement: TemplateElementNode): void {
  const dataStateValue = (node as Element).getAttribute(DATA_STATE);
  if (dataStateValue !== null) {
    const dataStatePath = getTemplateTokenValue(dataStateValue);
    let value = dataStatePath && get(values, dataStatePath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    if (dataStatePath && value && typeof value === "object") {
      childElement.state = {
        ...childElement.state,
        ...value
      };
      /*const asComponent = (childElement as IComponent);
      if (asComponent && typeof asComponent.state !== undefined && typeof asComponent.state === "object") {
        asComponent.state = {
          ...asComponent.state,
          value
        }
      } else {
        console.error("invalid value for %s [%o] for [%o]", DATA_STATE, value, values.this);
        throw new Error(`invalid value for ${DATA_STATE}`);
      }*/
    } else {
      console.error("invalid value for %s [%s]=[%o] for [%o]", DATA_STATE, dataStateValue, value, values.this);
      throw new Error(`invalid value for ${DATA_STATE}`);
    }
  }
}