import {DATA_FOR_EACH, DATA_FOR_EACH_ITEM, DATA_IF, DATA_ON, DATA_REF, DATA_STATE} from "./constants.js";
import {evaluateTextTemplate, get, getTemplateTokenValue, TemplateValues} from "../utils";

const IGNORE_ATTRIBUTES = [DATA_REF, DATA_IF, DATA_STATE, DATA_FOR_EACH, DATA_FOR_EACH_ITEM];

export function dataOnAndOtherAttributes(node: Node, values: TemplateValues, childElement: HTMLElement): void {
  const attributes = (node as Element).getAttributeNames();
  for (const attribute of attributes) {
    if (IGNORE_ATTRIBUTES.indexOf(attribute) === -1) {
      const attributeValue = (node as Element).getAttribute(attribute);
      if (attributeValue) {
        // console.log("%o %o %o", childElement, attribute, attributeValue);
        if (attribute.indexOf(DATA_ON) === 0) {
          const eventName = attributeValue ? attribute.substring(DATA_ON.length) : undefined;
          const dataOnPath = attributeValue ? getTemplateTokenValue(attributeValue) : undefined;
          const value = dataOnPath ? get(values, dataOnPath) : undefined;
          const callback = value && typeof value == "function" ? (value as Function).bind(values.this) as () => void : undefined;
          if (callback && eventName) {
            childElement.addEventListener(eventName, callback);
          } else {
            console.error("invalid value for %s [%s]=[%o] for [%o]", attribute, attributeValue, value, values.this);
            throw new Error(`invalid value for ${attribute}`);
          }
        } else {
          childElement.setAttribute(attribute, evaluateTextTemplate(attributeValue, values));
        }
      } else {
        childElement.setAttribute(attribute, "");
      }
    }
  }
}
