import {getTemplateTokenValue, TemplateValues} from "../../utils/index.js";
import {getTemplateFromLocation} from "../../cache.js";
import {TemplateNode} from "./node.js";
import {renderTemplate} from "../../render-template.js";

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

  public update(ref: Comment): boolean {
    super.update(ref);
    if (ref.textContent !== this.textContent) {
      ref.textContent = this.textContent;
      return true;
    }
    return false;
  }
}

export async function renderCommentNode(node: Node, values: TemplateValues): Promise<Array<TemplateNode>> {
  const path = getTemplateTokenValue(node.textContent);
  if (!path) {
    return node.textContent ? [new TemplateCommentNode(node.textContent)] : [];
  } else {
    const templateLocation = getTemplateFromLocation(path);
    if (!(templateLocation instanceof Promise)) {
      const ret = renderTemplate(templateLocation.template, values, templateLocation.xmlDocument);
      return ret ? ret : [];
    } else {
      const templateCache = await templateLocation;
      const ret = renderTemplate(templateCache.template, values, templateCache.xmlDocument);
      return ret ? ret : [];
    }
  }
}
