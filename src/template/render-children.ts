import {renderCommentNode, renderElementNode, renderTextNode} from "./vdom/nodes";
import {TemplateValues} from "./utils";
import {TemplateNode} from "./vdom";

export async function renderChildNodes(childNodes: NodeListOf<ChildNode>, values: TemplateValues): Promise<Array<TemplateNode>> {
  let ret: Array<TemplateNode> = [];
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    if (!node) {
      continue;
    }
    if (node.nodeType === Node.COMMENT_NODE && node.textContent !== null) {
      ret = ret.concat(await renderCommentNode(node, values));
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent !== null) {
      ret = ret.concat(renderTextNode(node, values));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ret = ret.concat(await renderElementNode(node, values));
    }
  }
  return ret;
}
