import {get, parse} from "@miqro/parser";

export const getTagName = (component: {
  new(...params: any[]): HTMLElement;
  tagName?: string;
}) => component.hasOwnProperty("tagName") ? String(component.tagName) : pascalCaseToDash(component.name);

export const normalizePath = (path: string) => {
  if (path.length > 1 && path.charAt(path.length - 1) === "/") {
    path = path.substring(0, path.length - 1);
  }
  return path;
};

export const decodeHTML = (str: string) => parse(str, "decodeHTML");

export const encodeHTML = (str: string) => parse(str, "encodeHTML");

export class EventEmitter {

  constructor(public defaultOptions?: EventInit) {
  }

  public emit(event: string, detail: any, element: Element | ShadowRoot, eventOptions?: EventInit): void {
    const options = eventOptions ? eventOptions : this.defaultOptions;
    element.dispatchEvent(new CustomEvent(event, options ? {
      ...options,
      detail
    } : {
      detail
    }));
  }
}

export function renderComponentOnElement(component: {
  state?: any;
  render?: () => string[] | string | void;
}, element: HTMLElement | ShadowRoot): void {
  console.log("renderOnElement [%s] dataset [%o] state [%o]", (element instanceof HTMLElement ? element : element.host as HTMLElement).tagName, ((element instanceof HTMLElement ? element : element.host as HTMLElement)).dataset, component.state);
  if (component && component.render) {
    let renderOutput = component.render();
    if (renderOutput instanceof Array) {
      renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
    }
    if (typeof renderOutput === "string") {
      element.innerHTML = "";
      const xmlDocument: XMLDocument = (new DOMParser()).parseFromString(`<root>${renderOutput}</root>`, "text/xml") as XMLDocument;
      const root = xmlDocument.children[0];
      renderNodeOnElement(component, element, root);
    }
  }
}

const DATA_REF = "data-ref";
const DATA_ON = "data-on-";

function renderAttributes(component: {
  render?: () => string[] | string | void;
}, childElement: Element, child: Element): void {
  const attributes = child.getAttributeNames();
  for (const attribute of attributes) {
    const attributeValue = child.getAttribute(attribute);
    if (attributeValue) {
      const isDataRef = attribute === DATA_REF;
      const isDataOn = attribute.indexOf(DATA_ON) === 0;
      if (isDataRef || isDataOn) {
        const path = getTemplateTagPath(attributeValue);
        const value = path ? get(component, path) : undefined;
        const callback = value && typeof value == "function" ? (value as Function).bind(component) : undefined;
        if (callback) {
          if (isDataRef) {
            (callback as (...args: any[]) => void)(childElement);
          } else if (isDataOn) {
            const eventName = attribute.substring(DATA_ON.length);
            childElement.addEventListener(eventName, (callback as (...args: any[]) => void));
          } else {
            console.error("%o.\nCannot use attribute [%s] as [%s] path [%s] with value [%s].", child, attribute, attributeValue, path, value);
          }
        } else {
          console.error("%o.\nCannot use attribute [%s] as [%s] path [%s] with value [%s].", child, attribute, attributeValue, path, value);
        }
      } else {
        childElement.setAttribute(attribute, renderTextContent(attributeValue, component));
      }
    } else {
      childElement.setAttribute(attribute, "");
    }
  }
}

function getTemplateTagPath(str: string): string | undefined {
  //if (str && str.length > 4 && str.substring(0, 2) === "{{" && str.substring(str.length - 2) === "}}") {
  if (str && typeof str === "string" && str.length > 3 && str.charAt(0) === "{" && str.charAt(str.length - 1) === "}") {
    //return str.substring(2, str.length - 2).trim();
    const path = str.substring(1, str.length - 1);
    if (path.indexOf(" ") !== -1 && !path) {
      return undefined;
    } else {
      return path;
    }
  }
  return undefined;
}

/*
replace "{...}" from string with only string values from values. the value from values is html encoded before being replaced.
 */
function renderTextContent(textContent: string, values: any): string {
  const re = /{[^{^}^\s]+}/g;
  return textContent.replace(re, (match) => {
    const path = getTemplateTagPath(match);
    if (path) {
      const value = get(values, path);
      if (typeof value === "function") {
        //return encodeHTML(String(value()));
        const callback = value.bind(values);
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

function renderNodeOnElement(component: {
  render?: () => string[] | string | void;
}, element: HTMLElement | ShadowRoot, node: Node): void {
  const nodes = node.childNodes;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) {
      continue;
    }
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      // avoid rendering templates on script and style tags.
      /*if (element instanceof HTMLElement && (element.tagName === "SCRIPT" || element.tagName === "STYLE")) {
        element.appendChild(node.cloneNode(true));
      } else {*/
      const childNode = document.createTextNode(renderTextContent(node.textContent, component));
      element.appendChild(childNode);
      //}
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childElement = document.createElement((node as Element).tagName);
      renderAttributes(component, childElement, node as Element);
      renderNodeOnElement(component, childElement, node);
      element.appendChild(childElement);
    }
  }
}

const pascalCaseToDash = (v: string): string => {
  let ret = '', prevLowercase = false, prevIsNumber = false
  for (let s of v) {
    const isUppercase = s.toUpperCase() === s
    const isNumber = !isNaN(parseInt(s, 10))
    if (isNumber) {
      if (prevLowercase) {
        ret += '-'
      }
    } else {
      if (isUppercase && (prevLowercase || prevIsNumber)) {
        ret += '-'
      }
    }
    ret += s
    prevLowercase = !isUppercase
    prevIsNumber = isNumber
  }
  return ret.replace(/-+/g, '-').toLowerCase()
};
