import {get} from "./get.js";
import {IVDOMNode} from "../vdom/nodes/node.js";

export type RefreshCallback = () => void;

export type RenderFunctionOutput = Promise<string[] | string | undefined> | string[] | string | void;

export interface AsyncRenderFunctionOutputPair {
  template: RenderFunctionOutput;
  values?: TemplateValues;
}

export interface RenderFunctionArgs {
  abortController: AbortController;
}


export type RenderEventListener = (evt: CustomEvent<AbortSignal>) => void;

export type RenderFunction = (args: RenderFunctionArgs) => AsyncRenderFunctionOutputPair | Promise<AsyncRenderFunctionOutputPair | string | undefined | void> | string | undefined | void;

/*export interface IComponent<S extends TemplateValues = TemplateValues> extends Node {
  state?: S;
  //template?: string;
  //templateChildren?: Array<Node | HTMLElement>;
  render?: () => RenderFunctionOutput;
  setState?: (args: any, callback?: () => void) => void;
  refresh?: () => void;
}*/

export interface TemplateValues {
  //this: undefined;
  [key: string]: any;

  //this: any;//IComponent;
  //children: Array<Node | HTMLElement>; // alias to this.templateChildren
}

export function nodeList2Array(childNodes?: NodeListOf<ChildNode>): Array<Node | HTMLElement> {
  const childrenNodes = [];
  if (childNodes) {
    for (let i = 0; i < childNodes.length; i++) {
      childrenNodes.push(childNodes[i])
    }
  }
  return childrenNodes;
}

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
