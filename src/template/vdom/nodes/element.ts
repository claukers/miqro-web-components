import {dataForEach, dataIf, dataIfn, dataOnAndOtherAttributes, dataRef} from "./attributes/index.js";
import {parseChildNodes} from "./child-nodes.js";
import {TemplateValues} from "../../../common/index.js";
import {VDOMNode} from "./node.js";

export class VDOMElement extends VDOMNode<HTMLElement> {

  public attributes: { attribute: string; value: string; }[];

  public listeners: { eventName: string; callback: (event: Event) => void; }[];

  public refListeners: { listener: Function; }[];

  constructor(public tagName: string) {
    super("Element");
    this.children = [];
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
    this.update(ref, true);
    for (const refListener of this.refListeners) {
      refListener.listener(ref);
    }
    if (this.children) {
      for (const child of this.children) {
        try {
          const element = child.create(ref);
          ref.appendChild(element);
        } catch(e) {
          throw e;
        }
      }
    }
    return ref;
  }

  public update(ref: HTMLElement, first = false): boolean {
    super.update(ref);
    let ret = false;
    for (const attribute of this.attributes) {
      if (ref.getAttribute(attribute.attribute) !== attribute.value) {
        ret = true;
        ref.setAttribute(attribute.attribute, attribute.value);
      }
    }
    for (const listener of this.listeners) {
      ref.addEventListener(listener.eventName, listener.callback);
    }
    return ret;
  }

  public disconnect(ref: HTMLElement) {
    for (const listener of this.listeners) {
      ref.removeEventListener(listener.eventName, listener.callback);
    }
    super.disconnect(ref);
  }

  public compare(other: VDOMElement): boolean {
    return super.compare(other) && other.tagName === this.tagName;
  }

  public toString(): string {
    return `${this.type} TemplateNode ${this.tagName}`;
  }
}

export async function renderElementNode(node: Node, values: TemplateValues): Promise<VDOMNode[]> {
  return dataForEach(node, values, async (node: Node, values: TemplateValues) => {
    if (dataIf(node as Element, values) && dataIfn(node as Element, values)) {
      const tagName = (node as Element).tagName;
      const childElement = new VDOMElement(tagName);
      //dataState(node, values, childElement);
      dataRef(node, values, childElement);
      dataOnAndOtherAttributes(node, values, childElement);
      childElement.children = await parseChildNodes(node.childNodes, values);
      return childElement;
    }
  });
}
