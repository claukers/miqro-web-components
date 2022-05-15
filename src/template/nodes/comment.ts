import {TemplateValues, getTemplateTokenValue, IComponent} from "../utils/index.js";
import {getTemplateFromLocation} from "../cache.js";
import {renderTemplate} from "../render.js";
import {TemplateCommentNode, TemplateNode} from "../utils/template.js";

export function renderCommentNode(node: Node, values: TemplateValues): Array<TemplateNode> {
  const path = getTemplateTokenValue(node.textContent);
  if (!path) {
    return node.textContent ? [new TemplateCommentNode(node.textContent)] : [];
  } else {
    const templateLocation = getTemplateFromLocation(path);
    if (typeof templateLocation === "string") {
      const ret = renderTemplate(templateLocation, values);
      return ret ? ret : [];
    } else {
      const asIComponent = values.this as IComponent;
      if (asIComponent.refresh) {
        templateLocation.then(function queueRenderComponent(template) {
          if (asIComponent.refresh) {
            asIComponent.refresh();
          }
        }).catch(e => {
          console.error("cannot render node %o from %o", node, values.this);
          console.error(e);
        });
      }
    }
    return [];
  }
}
