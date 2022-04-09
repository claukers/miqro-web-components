import {renderElementNode} from "./element.js";
import {renderCommentNode} from "./comment.js";
import {renderTextNode} from "./text.js";

export function renderNodeChildrenOnElement(nodes: NodeListOf<ChildNode>, values: any, templateChildrenMap: WeakMap<HTMLElement, (HTMLElement | Node)[]>): Array<Node | HTMLElement> {
  let ret: Array<Node | HTMLElement> = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) {
      continue;
    }
    if (node.nodeType === Node.COMMENT_NODE && node.textContent !== null) {
      ret = ret.concat(renderCommentNode(node, values, templateChildrenMap));
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent !== null) {
      ret = ret.concat(renderTextNode(node, values, templateChildrenMap));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ret = ret.concat(renderElementNode(node, values, templateChildrenMap));
    }
  }
  return ret;
}
