import {dataForEach, dataIf, dataIfn, dataOnAndOtherAttributes, dataRef, dataState} from "./attributes";
import {renderChildNodes} from "../../render-children.js";
import {IComponent, TemplateValues} from "../../utils";
import {RefreshCallback} from "../../utils/template.js";
import {TemplateNode} from "./node.js";

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

export function renderElementNode(node: Node, values: TemplateValues, refresh?: RefreshCallback): TemplateNode[] {
  return dataForEach(node, values, (node: Node, values: TemplateValues) => {
    if (dataIf(node as Element, values) && dataIfn(node as Element, values)) {
      const tagName = (node as Element).tagName;
      //const childElement = document.createElement(tagName);
      const childElement = new TemplateElementNode(tagName);
      dataState(node, values, childElement);
      dataRef(node, values, childElement);
      dataOnAndOtherAttributes(node, values, childElement);

      childElement.children = renderChildNodes(node.childNodes, values, refresh);
      /*const childrenNodes = renderChildNodes(node.childNodes, values);
      for (const child of childrenNodes) {
        childElement.appendChild(child);
      }*/

      return childElement;
    }
  });
}
