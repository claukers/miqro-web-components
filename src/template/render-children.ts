import {renderCommentNode, renderElementNode, renderTextNode} from "./nodes/index.js";
import {TemplateValues} from "./utils/index.js";
import {RefreshCallback, TemplateNode} from "./utils/template.js";

export function renderChildNodes(childNodes: NodeListOf<ChildNode>, values: TemplateValues, refresh?: RefreshCallback): Array<TemplateNode> {
  let ret: Array<TemplateNode> = [];
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    if (!node) {
      continue;
    }
    if (node.nodeType === Node.COMMENT_NODE && node.textContent !== null) {
      ret = ret.concat(renderCommentNode(node, values, refresh));
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent !== null) {
      ret = ret.concat(renderTextNode(node, values));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ret = ret.concat(renderElementNode(node, values, refresh));
    }
  }
  return ret;
}
