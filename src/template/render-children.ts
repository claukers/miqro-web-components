import {renderCommentNode, renderElementNode, renderTextNode} from "./nodes";
import {TemplateValues} from "./utils";

export function renderChildNodes(childNodes: NodeListOf<ChildNode>, values: TemplateValues): Array<Node | HTMLElement> {
  let ret: Array<Node | HTMLElement> = [];
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
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
