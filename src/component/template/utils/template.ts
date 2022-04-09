import {get} from "./get";

export interface IComponent {
  render?: () => string | string[] | void;
  setState?: (args: any, refresh?: boolean) => void;
}

export function nodeList2Array(childNodes: NodeListOf<ChildNode>) {
  const childrenNodes = [];
  for (let i = 0; i < childNodes.length; i++) {
    childrenNodes.push(childNodes[i])
  }
  return childrenNodes;
}

export function getTemplateTagPath(str: string | null): string | undefined {
  if (str && typeof str === "string" && str.length > 3 && str.charAt(0) === "{" && str.charAt(str.length - 1) === "}") {
    const path = str.substring(1, str.length - 1);
    if (path.indexOf(" ") !== -1 && !path) {
      return undefined;
    } else {
      return path;
    }
  }
  return undefined;
}

export function evaluateTextTemplate(textContent: string, values: any): string {
  const re = /{[^%^{^}^\s]+}/g;
  return textContent.replace(re, (match) => {
    const path = getTemplateTagPath(match);
    if (path) {
      const value = get(values, path);
      if (typeof value === "function") {
        //return encodeHTML(String(value()));
        const callback = value.bind(values.this);
        return String(callback());
      } else {
        //return encodeHTML(String(value));
        return String(value);
      }
    } else {
      return match;
    }
  });
}
