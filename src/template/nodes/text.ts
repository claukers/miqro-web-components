import {get, getTemplateTokenValue, re, TemplateValues} from "../utils";

export function renderTextNode(node: Node, values: TemplateValues): Array<HTMLElement | Node> {
  let ret: Array<HTMLElement | Node> = [];
  if (node.textContent) {
    const firstTextNode = document.createTextNode("");
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
          ret = ret.concat(value);
          currentTextNode = document.createTextNode("");
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
