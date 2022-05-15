import {get} from "./get.js";
import {ComponentState} from "../../component/component.js";

export type TemplateNodeType = "Element" | "Text" | "Comment" | "HTMLElementRef";

export interface ITemplateNode<S extends Node = Node> {
  ref?: S;
  children?: ITemplateNode[];
  type: TemplateNodeType;
  parent?: HTMLElement;

  create(parent: HTMLElement): S;

  update(ref: S): void;

  dispose(ref: S): void;

  compare(other: ITemplateNode<S>): boolean;
}

export class TemplateNode<S extends Node = Node> implements ITemplateNode<S> {

  public ref?: S;
  public children?: TemplateNode[];
  public parent?: HTMLElement;

  constructor(public type: TemplateNodeType) {
  }

  public create(parent: HTMLElement): S {
    throw new Error("not implemented!");
  }

  public update(ref: S): void {
    if (this.ref && this.ref !== ref) {
      throw new Error("already created!");
    }
    if (!this.ref) {
      this.ref = ref;
    }
  }

  public dispose(element: S): void {
    this.ref = undefined;
    this.children = undefined;
    this.parent = undefined;
  }

  public compare(other: TemplateNode<S>): boolean {
    return other.type === this.type;
  }

  public toString(): string {
    return `${this.type} TemplateNode`;
  }
}

export class TemplateHTMLElementRefNode extends TemplateNode<HTMLElement> {
  constructor(public ref: HTMLElement) {
    super("HTMLElementRef");
  }

  public create(parent: HTMLElement) {
    this.parent = parent;
    return this.ref;
  }

  public compare(other: TemplateHTMLElementRefNode): boolean {
    return super.compare(other) && other.ref === this.ref;
  }
}

export class TemplateCommentNode extends TemplateNode<Comment> {
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

export class TemplateTextNode extends TemplateNode<Text> {
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

  public update(ref: Text): void {
    super.update(ref);
    if (ref.textContent !== this.textContent) {
      ref.textContent = this.textContent;
    }
  }
}

export class TemplateElementNode extends TemplateNode<HTMLElement> {

  public state: any;

  public attributes: { attribute: string; value: string; }[];

  public listeners: { eventName: string; callback: (event: Event) => void; }[];

  public refListeners: { listener: Function; }[];

  constructor(public tagName: string) {
    super("Element");
    this.children = [];
    this.state = {};
    this.attributes = [];
    this.listeners = [];
    this.refListeners = [];
  }

  public create(parent: HTMLElement): HTMLElement {
    if (this.ref) {
      throw new Error("already created!");
    }
    this.parent = parent;
    const ref = document.createElement(this.tagName);
    this.update(ref);
    for (const refListener of this.refListeners) {
      refListener.listener(ref);
    }
    if (this.children) {
      for (const child of this.children) {
        const element = child.create(ref);
        ref.appendChild(element);
      }
    }
    return ref;
  }

  public update(ref: HTMLElement): void {
    super.update(ref);
    const asComponent = ref as IComponent;
    if (asComponent.state) {
      asComponent.state = {
        ...asComponent.state,
        ...this.state
      };
    }
    for (const attribute of this.attributes) {
      if (ref.getAttribute(attribute.attribute) !== attribute.value) {
        ref.setAttribute(attribute.attribute, attribute.value);
      }
    }

    for (const listener of this.listeners) {
      ref.addEventListener(listener.eventName, listener.callback);
    }
  }

  public dispose(ref: HTMLElement) {
    for (const listener of this.listeners) {
      ref.removeEventListener(listener.eventName, listener.callback);
    }
    super.dispose(ref);
  }

  public compare(other: TemplateElementNode): boolean {
    return super.compare(other) && other.tagName === this.tagName;
  }

  public toString(): string {
    return `${this.type} TemplateNode ${this.tagName}`;
  }
}

export interface IComponent<S extends ComponentState = ComponentState> extends HTMLElement {
  stateChangedCallback?(oldState: S): boolean;

  state?: S;
  templateChildren?: Array<Node | HTMLElement>;
  render?: () => string | void;
  setState?: (args: any, callback?: () => void) => void;
  refresh?: () => void;
}

export interface TemplateValues {
  this: IComponent;
  children: Array<Node | HTMLElement>; // alias to this.templateChildren
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

export function textTemplateReplace(value: any, functionBind: any): string {
  if (typeof value === "function") {
    //return encodeHTML(String(value()));
    const callback = value.bind(functionBind);
    return String(callback());
  } else {
    //return encodeHTML(String(value));
    return String(value);
  }
}

export function evaluateTextTemplate(textContent: string, values: any): string {
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
