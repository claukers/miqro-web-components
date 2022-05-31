import {get, getTemplateTokenValue, re, TemplateValues} from "../../utils/index.js";
import {TemplateNode} from "./node.js";

class TemplateTextNode extends TemplateNode<Text> {
  constructor(public textContent: string) {
    super("Text");
  }

  public create(parent: HTMLElement) {
    if (this.ref) {
      throw new Error("already created!");
    }
    this.parent = parent;
    const ref = document.createTextNode("");
    this.update(ref);
    return ref;
  }

  public update(ref: Text): boolean {
    super.update(ref);
    if (ref.textContent !== this.textContent) {
      ref.textContent = this.textContent;
      return true;
    }
    return false;
  }
}

class TemplateHTMLElementRefNode extends TemplateNode<HTMLElement> {
  constructor(public ref: HTMLElement) {
    super("HTMLElementRef");
  }

  public create(parent: HTMLElement) {
    this.parent = parent;
    this.update(this.ref);
    return this.ref;
  }

  public compare(other: TemplateHTMLElementRefNode): boolean {
    return super.compare(other) && other.ref === this.ref;
  }
}

export function renderTextNode(node: Node, values: TemplateValues): Array<TemplateNode> {
  let ret: Array<TemplateNode> = [];
  if (node.textContent) {
    const firstTextNode = new TemplateTextNode("");
    let currentTextNode = firstTextNode;
    firstTextNode.textContent = node.textContent.replace(re, (match) => {
      const path = getTemplateTokenValue(match);
      if (path) {
        let value = get(values, path);
        if (typeof value === "function") {
          const callback = value.bind(values.this);
          value = callback();
        }
        const isNodeArray = value instanceof Array && value.filter(v => !(v instanceof Node)).length === 0;
        if (isNodeArray || value instanceof HTMLElement) {
          ret.push(currentTextNode);
          const refs = isNodeArray ? value as Node[] : [value] as Node[];
          ret = ret.concat(refs.map(ref => new TemplateHTMLElementRefNode(ref as HTMLElement)));
          currentTextNode = new TemplateTextNode("");
          return "";
        } else {
          if (ret.length === 0) {
            return String(value);
          } else {
            currentTextNode.textContent += String(value);
            return "";
          }
        }
      } else {
        if (ret.length === 0) {
          return match;
        } else {
          currentTextNode.textContent += match;
          return "";
        }
      }
    });
    if (currentTextNode.textContent !== "") {
      ret.push(currentTextNode);
    }
  }
  return ret;
}
