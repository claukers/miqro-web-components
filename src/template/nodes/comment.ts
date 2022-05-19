import {TemplateValues, getTemplateTokenValue, IComponent} from "../utils/index.js";
import {getTemplateFromLocation} from "../cache.js";
import {renderTemplate} from "../render.js";
import {RefreshCallback, TemplateCommentNode, TemplateNode} from "../utils/template.js";

export function renderCommentNode(node: Node, values: TemplateValues, refresh?: RefreshCallback): Array<TemplateNode> {
  const path = getTemplateTokenValue(node.textContent);
  if (!path) {
    return node.textContent ? [new TemplateCommentNode(node.textContent)] : [];
  } else {
    const templateLocation = getTemplateFromLocation(path);
    if (typeof templateLocation === "string") {
      const ret = renderTemplate(templateLocation, values, refresh);
      return ret ? ret : [];
    } else {
      if (refresh) {
        setTimeout(function getRemoteTemplateTimeout() {
          templateLocation.then(function queueRenderComponent(template) {
            try {
              refresh();
            } catch (e) {
              console.error(e);
            }
          }).catch(e => {
            console.error("cannot render node %o from %o", node, values.this);
            console.error(e);
          });
        }, 0);
      }
    }
    return [];
  }
}
