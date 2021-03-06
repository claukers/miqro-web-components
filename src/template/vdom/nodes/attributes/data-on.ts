import {DATA_FOR_EACH, DATA_FOR_EACH_ITEM, DATA_IF, DATA_ON, DATA_REF, DATA_STATE} from "./constants.js";
import {evaluateTextTemplateForAttribute, getTemplateTokenValue} from "../../../utils/index.js";
import {VDOMElement} from "../element.js";
import {log, LOG_LEVEL, TemplateValues, get} from "../../../../common/index.js";

const IGNORE_ATTRIBUTES = [DATA_REF, DATA_IF, DATA_STATE, DATA_FOR_EACH, DATA_FOR_EACH_ITEM];

export function dataOnAndOtherAttributes(node: Node, values: TemplateValues, childElement: VDOMElement): void {
  const attributes = (node as Element).getAttributeNames();
  for (const attribute of attributes) {
    if (IGNORE_ATTRIBUTES.indexOf(attribute) === -1) {
      const attributeValue = (node as Element).getAttribute(attribute);
      if (attributeValue) {
        if (attribute.indexOf(DATA_ON) === 0) {
          const eventName = attributeValue ? attribute.substring(DATA_ON.length) : undefined;
          const dataOnPath = attributeValue ? getTemplateTokenValue(attributeValue) : undefined;
          const value = dataOnPath ? get(values, dataOnPath) : undefined;
          const callback = value && typeof value == "function" ? (value as Function).bind(values.this) as () => void : undefined;
          if (callback && eventName) {
            childElement.listeners.push({eventName, callback});
            // childElement.addEventListener(eventName, callback);
          } else {
            log(LOG_LEVEL.error, "invalid value for %s [%s]=[%o][%o] for [%o]", attribute, attributeValue, values, value, node);
            throw new Error(`invalid value for ${attribute}`);
          }
        } else {
          childElement.attributes.push({attribute, value: evaluateTextTemplateForAttribute(attributeValue, values)});
        }
      } else {
        childElement.attributes.push({attribute, value: ""});
      }
    }
  }
}
