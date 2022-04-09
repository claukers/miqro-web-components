import {getTemplateTagPath} from "../utils.js";
import {getTemplateLocation} from "../cache.js";
import {renderTemplate} from "../render.js";

export function renderCommentNode(node: Node, values: any, templateChildrenMap: WeakMap<HTMLElement, (HTMLElement | Node)[]>): Array<HTMLElement | Node> {
  const path = getTemplateTagPath(node.textContent);
  if (path === "children") {
    const templateChildren = values && values.this ? templateChildrenMap.get(values.this) : undefined;
    return templateChildren ? templateChildren : [];
  } else {
    const template = path && getTemplateLocation(path);
    if (template) {
      if (typeof template === "string") {
        const ret = renderTemplate(template, values, templateChildrenMap);
        return ret ? ret : [];
      } else {
        template.then(function queueRenderComponent(template) {
          values.this.setState({});
        }).catch(e => {
          console.error("cannot render node %o from %o", node, values.this);
          console.error(e);
        });
      }
    } else if (node.textContent) {
      return [document.createComment(node.textContent)];
    }
    return [];
  }
}
