import {get, getTemplateTokenValue, re, TemplateValues} from "../utils";
import {TemplateHTMLElementRefNode, TemplateNode, TemplateTextNode} from "../utils/template.js";

export function renderTextNode(node: Node, values: TemplateValues): Array<TemplateNode> {
  let ret: Array<TemplateNode> = [];
  if (node.textContent) {
    //const firstTextNode = document.createTextNode("");
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
          ret = ret.concat(new TemplateHTMLElementRefNode(value as HTMLElement));
          //currentTextNode = document.createTextNode("");
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
