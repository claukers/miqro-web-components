import {getTemplateTokenValue, TemplateValues} from "../../utils";
import {getTemplateFromLocation} from "../../cache.js";
import {renderTemplate} from "../../render.js";
import {RefreshCallback} from "../../utils/template.js";
import {TemplateNode} from "./node.js";

class TemplateCommentNode extends TemplateNode<Comment> {
  constructor(public textContent: string) {
    super("Comment");
  }

  public create(parent: HTMLElement) {
    if (this.ref) {
      throw new Error("already created!");
    }
    this.parent = parent;
    const ref = document.createComment("");
    this.update(ref);
    return ref;
  }

  public update(ref: Comment): void {
    super.update(ref);
    if (ref.textContent !== this.textContent) {
      ref.textContent = this.textContent;
    }
  }
}

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
