import {evaluateTextTemplate} from "../utils";

export function renderTextNode(node: Node, values: any, templateChildrenMap: WeakMap<HTMLElement, (HTMLElement | Node)[]>): Array<HTMLElement | Node> {
  return node.textContent ? [document.createTextNode(evaluateTextTemplate(node.textContent, values))] : []
}
