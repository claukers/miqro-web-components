import {IVDOMNode} from "../vdom/nodes/node.js";
import {get} from "../../common/index.js";

export function getTemplateTokenValue(str: string | null): string | undefined {
  if (str && typeof str === "string" && str.length > 3 && str.charAt(0) === "{" && str.charAt(str.length - 1) === "}") {
    const path = str.substring(1, str.length - 1);
    if (!path || path.indexOf(" ") !== -1) {
      return undefined;
    } else {
      return path;
    }
  }
  return undefined;
}

export const re = /{[^%^{^}^\s]+}/g;

function textTemplateReplace(value: any, functionBind: any): string {
  if (typeof value === "function") {
    const callback = value.bind(functionBind);
    return String(callback());
  } else {
    if (value !== undefined) {
      return String(value);
    } else {
      return "";
    }
  }
}

export function evaluateTextTemplateForAttribute(textContent: string, values: any): string {
  return textContent.replace(re, (match) => {
    const path = getTemplateTokenValue(match);
    if (path) {
      const value = get(values, path);
      return textTemplateReplace(value, values.this);
    } else {
      return match;
    }
  });
}

export function removeChild(c: IVDOMNode) {
  if (c.ref) {
    if (c.parent) {
      removeChildren(c.parent, c.ref);
    } else {
      (c.ref as HTMLElement).remove();
    }
  }
}

export function removeChildrenFrom(old: IVDOMNode[], from: number): void {
  const splicedOld = old.splice(from);
  splicedOld.forEach(removeChild);
}

export function appendChildren(root: Node, children: Node | Node[]) {
  if (children instanceof Array) {
    for (const cR of children) {
      root.appendChild(cR);
    }
  } else {
    root.appendChild(children);
  }
}

export function removeChildren(root: HTMLElement, children: Node | Node[]) {
  if (children instanceof Array) {
    for (const cR of children) {
      root.removeChild(cR);
    }
  } else {
    root.removeChild(children);
  }
}
