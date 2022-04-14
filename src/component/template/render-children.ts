import {renderCommentNode, renderElementNode, renderTextNode} from "./nodes/index.js";

export function renderNodeChildrenOnElement(nodes: NodeListOf<ChildNode>, values: any): Array<Node | HTMLElement> {
  let ret: Array<Node | HTMLElement> = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) {
      continue;
    }
    if (node.nodeType === Node.COMMENT_NODE && node.textContent !== null) {
      ret = ret.concat(renderCommentNode(node, values));
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent !== null) {
      ret = ret.concat(renderTextNode(node, values));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ret = ret.concat(renderElementNode(node, values));
    }
  }
  return ret;
}
