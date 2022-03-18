import {get} from "@miqro/parser";
import {evaluateTextTemplate, getTemplateTagPath} from "./template.js";
import {TemplateLoader} from "./template-loader";

export interface IComponent {
  state?: any;
  render?: () => string[] | string | void;
  setState?: (args: object, refresh?: boolean) => void;
}

export function renderTemplateOnElement(renderOutput: string | string[] | void, values: any, element: HTMLElement | ShadowRoot, clear = true): void {
  // console.log("renderOnElement [%s] dataset [%o] state [%o]", (element instanceof HTMLElement ? element : element.host as HTMLElement).tagName, ((element instanceof HTMLElement ? element : element.host as HTMLElement)).dataset, component.state);
  if (renderOutput instanceof Array) {
    renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
  }
  if (typeof renderOutput === "string") {
    const xmlDocument: XMLDocument = (new DOMParser()).parseFromString(`<root>${renderOutput}</root>`, "text/xml") as XMLDocument;
    if (clear) {
      element.innerHTML = "";
    }
    const root = xmlDocument.children[0];
    renderNodeChildrenOnElement(root.childNodes, values, element);
  }
}

const DATA_REF = "data-ref";
const DATA_ON = "data-on-";
const DATA_FOR_EACH = "data-for-each";
const DATA_FOR_EACH_ITEM = "data-for-each-item";
const DATA_IF = "data-if";
const DATA_IFN = "data-ifn";
const DATA_STATE = "data-state";

const IGNORE_ATTRIBUTES = [DATA_REF, DATA_IF, DATA_STATE, DATA_FOR_EACH, DATA_FOR_EACH_ITEM];

function renderNodeChildrenOnElement(nodes: NodeListOf<ChildNode>, values: any, element: HTMLElement | ShadowRoot): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) {
      continue;
    }
    if (node.nodeType === Node.COMMENT_NODE && node.textContent) {
      const path = getTemplateTagPath(node.textContent);
      if (path) {
        const template = TemplateLoader.renderTemplate(values.this, path);
        if (template) {
          renderTemplateOnElement(template, values, element, false);
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      element.appendChild(document.createTextNode(evaluateTextTemplate(node.textContent, values)));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childElements = renderElementNode(node, values);
      for (const c of childElements) {
        element.appendChild(c);
      }
    }
  }
}

function renderElementNode(node: Node, v: any): HTMLElement[] {
  return dataForEach(node, v, (node: Node, values: any) => {
    if (dataIf(node as Element, values) && dataIfn(node as Element, values)) {
      const childElement = document.createElement((node as Element).tagName);
      dataState(node, values, childElement);
      dataRef(node, values, childElement);
      dataOnAndOtherAttributes(node, values, childElement);

      renderNodeChildrenOnElement(node.childNodes, values, childElement);
      return childElement;
    }
  });
}

function dataOnAndOtherAttributes(node: Node, values: any, childElement: HTMLElement): void {
  const attributes = (node as Element).getAttributeNames();
  for (const attribute of attributes) {
    if (IGNORE_ATTRIBUTES.indexOf(attribute) === -1) {
      const attributeValue = (node as Element).getAttribute(attribute);
      if (attributeValue) {
        if (attribute.indexOf(DATA_ON) === 0) {
          const eventName = attributeValue ? attribute.substring(DATA_ON.length) : undefined;
          const dataOnPath = attributeValue ? getTemplateTagPath(attributeValue) : undefined;
          const value = dataOnPath ? get(values, dataOnPath) : undefined;
          const callback = value && typeof value == "function" ? (value as Function).bind(values.this) as () => void : undefined;
          if (callback && eventName) {
            childElement.addEventListener(eventName, callback);
          } else {
            console.error("invalid value for %s [%s]=[%o] for [%o]", attribute, attributeValue, value, values.this);
            throw new Error(`invalid value for ${attribute}`);
          }
        } else {
          childElement.setAttribute(attribute, evaluateTextTemplate(attributeValue, values));
        }
      } else {
        childElement.setAttribute(attribute, "");
      }
    }
  }
}

function dataRef(node: Node, values: any, childElement: HTMLElement): void {
  const dataRefValue = (node as Element).getAttribute(DATA_REF);
  if (dataRefValue !== null) {
    const dataRefPath = getTemplateTagPath(dataRefValue);
    const value = dataRefPath ? get(values, dataRefPath) : undefined;
    const callback = value && typeof value == "function" ? (value as Function).bind(values.this) : undefined;
    if (callback) {
      callback(childElement);
    } else {
      console.error("invalid value for %s [%s]=[%o] for [%o]", DATA_REF, dataRefValue, value, values.this);
      throw new Error(`invalid value for ${DATA_REF}`);
    }
  }
}

function dataForEach(node: Node, values: any, cb: (node: Node, values: any) => HTMLElement | undefined): HTMLElement[] {
  const forEachValue = (node as Element).getAttribute(DATA_FOR_EACH);
  const forEachItemValue = (node as Element).getAttribute(DATA_FOR_EACH_ITEM);
  if (forEachValue !== null) {
    const ret = [];
    const forEachPath = getTemplateTagPath(forEachValue);
    let value = forEachPath && get(values, forEachPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    if (forEachPath && value && value instanceof Array) {
      const vValues: any = {
        ...values
      };
      for (let index = 0; index < value.length; index++) {
        vValues[forEachItemValue !== null ? forEachItemValue : "item"] = value[index];
        vValues.index = index;
        const r = cb(node, vValues);
        if (r) {
          ret.push(r);
        }
      }
      return ret;
    } else {
      console.error("invalid value for data-for-each [%s]=[%o] for [%o]", forEachValue, value, values.this);
      throw new Error(`invalid value for ${DATA_FOR_EACH}`);
    }
  } else {
    const ret = cb(node, values);
    return ret ? [ret] : [];
  }
}

function dataState(node: Node, values: any, childElement: HTMLElement): void {
  const dataStateValue = (node as Element).getAttribute(DATA_STATE);
  if (dataStateValue !== null) {
    const dataStatePath = getTemplateTagPath(dataStateValue);
    let value = dataStatePath && get(values, dataStatePath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    if (dataStatePath && value && typeof value === "object") {
      const asComponent = (childElement as IComponent);
      if (asComponent && asComponent.state && typeof asComponent.setState === "function") {
        asComponent.setState(value, false);
      } else {
        console.error("invalid value for data-state [%o] for [%o]", value, values.this);
        throw new Error(`invalid value for ${DATA_STATE}`);
      }
    } else {
      console.error("invalid value for data-state [%s]=[%o] for [%o]", dataStateValue, value, values.this);
      throw new Error(`invalid value for ${DATA_STATE}`);
    }
  }
}

function dataIfn(node: Element, values: any): boolean {
  const ifnValue = (node as Element).getAttribute(DATA_IFN);
  if (ifnValue !== null) {
    const ifnPath = getTemplateTagPath(ifnValue);
    if (!ifnPath) {
      console.error("invalid value for data-ifn [%s] for [%o]", ifnValue, values.this);
      throw new Error("invalid value for data-ifn");
    }
    let value = ifnPath && get(values, ifnPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    return !!!value;
  } else {
    return true;
  }
}

function dataIf(node: Element, values: any): boolean {
  const ifValue = (node as Element).getAttribute(DATA_IF);
  if (ifValue !== null) {
    const ifPath = getTemplateTagPath(ifValue);
    if (!ifPath) {
      console.error("invalid value for data-if [%s] for [%o]", ifValue, values.this);
      throw new Error("invalid value for data-if");
    }
    let value = ifPath && get(values, ifPath);
    value = typeof value === "function" ? (value.bind(values.this))() : value;
    return !!value;
  } else {
    return true;
  }
}
