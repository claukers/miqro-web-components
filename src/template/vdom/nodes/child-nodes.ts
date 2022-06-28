import {renderCommentNode} from "./comment.js";
import {renderElementNode} from "./element.js";
import {renderTextNode} from "./text.js";
import {TemplateValues} from "../../utils/index.js";
import {VDOMNode} from "./node.js";

export async function renderChildNodes(childNodes: NodeListOf<ChildNode>, values: TemplateValues): Promise<Array<VDOMNode>> {
  let ret: Array<VDOMNode> = [];
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
