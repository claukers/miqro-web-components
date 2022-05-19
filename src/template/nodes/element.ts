import {dataForEach, dataIf, dataIfn, dataOnAndOtherAttributes, dataRef, dataState} from "../attributes/index.js";
import {renderChildNodes} from "../render-children.js";
import {TemplateValues} from "../utils/index.js";
import {RefreshCallback, TemplateElementNode, TemplateNode} from "../utils/template.js";

export function renderElementNode(node: Node, values: TemplateValues, refresh?: RefreshCallback): TemplateNode[] {
  return dataForEach(node, values, (node: Node, values: TemplateValues) => {
    if (dataIf(node as Element, values) && dataIfn(node as Element, values)) {
      const tagName = (node as Element).tagName;
      //const childElement = document.createElement(tagName);
      const childElement = new TemplateElementNode(tagName);
      dataState(node, values, childElement);
      dataRef(node, values, childElement);
      dataOnAndOtherAttributes(node, values, childElement);

      childElement.children = renderChildNodes(node.childNodes, values, refresh);
      /*const childrenNodes = renderChildNodes(node.childNodes, values);
      for (const child of childrenNodes) {
        childElement.appendChild(child);
      }*/

      return childElement;
    }
  });
}
