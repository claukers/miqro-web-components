import {getTemplateTokenValue} from "../utils/index.js";
import {getTemplateLocation} from "../cache.js";
import {renderTemplate} from "../render.js";

export function renderCommentNode(node: Node, values: any): Array<HTMLElement | Node> {
  const path = getTemplateTokenValue(node.textContent);
  if (!path) {
    return node.textContent ? [document.createComment(node.textContent)] : [];
  } else if (path === "children") {
    return values.children ? values.children : [];
  } else {
    const templateLocation = getTemplateLocation(path);
    if (typeof templateLocation === "string") {
      const ret = renderTemplate(templateLocation, values);
      return ret ? ret : [];
    } else {
      templateLocation.then(function queueRenderComponent(template) {
        values.this.setState({});
      }).catch(e => {
        console.error("cannot render node %o from %o", node, values.this);
        console.error(e);
      });
    }
    return [];
  }
}
