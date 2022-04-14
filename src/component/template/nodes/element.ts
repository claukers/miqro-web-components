import {dataForEach, dataIf, dataIfn, dataOnAndOtherAttributes, dataRef, dataState} from "../attributes/index.js";
import {renderNodeChildrenOnElement} from "../render-children.js";

export function renderElementNode(node: Node, v: any): HTMLElement[] {
  return dataForEach(node, v, (node: Node, values: any) => {
    if (dataIf(node as Element, values) && dataIfn(node as Element, values)) {
      const childElement = document.createElement((node as Element).tagName);
      dataState(node, values, childElement);
      dataRef(node, values, childElement);
      dataOnAndOtherAttributes(node, values, childElement);
      const childrenNodes = renderNodeChildrenOnElement(node.childNodes, values);
      for (const child of childrenNodes) {
        childElement.appendChild(child);
      }
      return childElement;
    }
  });
}
