import {evaluateTextTemplate} from "../utils/index.js";

export function renderTextNode(node: Node, values: any, templateChildrenMap: WeakMap<HTMLElement, (HTMLElement | Node)[]>): Array<HTMLElement | Node> {
  return node.textContent ? [document.createTextNode(evaluateTextTemplate(node.textContent, values))] : []
}
