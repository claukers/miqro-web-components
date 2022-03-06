import {get, parse} from "@miqro/parser";

export const normalizePath = (path: string) => {
  if (path.length > 1 && path.charAt(path.length - 1) === "/") {
    path = path.substring(0, path.length - 1);
  }
  return path;
}

export const renderTag = (tagName: string) => `<${tagName}></${tagName}>`;

export function decodeHTML(str: string) {
  return parse(str, "decodeHtml");
}

export function encodeHTML(str: string) {
  return parse(str, "encodeHtml");
}

export class EventCacheEmitter {

  private _events: Map<string, Event> = new Map<string, Event>();

  constructor(public defaultOptions?: EventInit) {
  }

  public emit(event: string, element: Element | ShadowRoot): void {
    if (!this._events.has(event)) {
      this.registerEvent(event);
    }
    element.dispatchEvent(this._events.get(event) as Event);
  }

  public registerEvent(event: string, eventOptions?: EventInit): void {
    this._events.set(event, new Event(event, eventOptions ? eventOptions : this.defaultOptions));
  }
}


/*
implements the render lifecycle for render -> setProps ( only if objects are passed ) -> afterRender
 */
export function renderOnElement(component: {
  render?(): string | void;

}, element: HTMLElement | ShadowRoot): void {
  // const {tagName, dataset} = element instanceof HTMLElement ? element : element.host as HTMLElement;
  // console.log("renderOnElement [%s] dataset [%o] state [%o]", tagName, dataset, component.state);
  if (component.render) {
    const renderOutput = component.render();
    if (typeof renderOutput === "string") {
      const rendered = renderTemplate(renderOutput, component);
      if (rendered !== undefined) {
        element.innerHTML = rendered;
        // because innerHTML is replaced we must re-hook events
        const childElements = element.querySelectorAll("*");
        for (let i = 0; i < childElements.length; i++) {
          const child = childElements[i];
          hookElementEvents(child, component);
        }
      }
    }
  } else {
    console.error("component.render not defined render will do nothing.");
  }
}

/*
renders this.props for element. if values is passed it will try to render "{...}" with values as a template.
 */
function hookElementEvents(element: Element, values: any): void {
  const attributes = element.getAttributeNames();
  for (const attributeName of attributes) {
    const value = element.getAttribute(attributeName);
    if (value && value.charAt(0) === "{" && value.charAt(value.length - 1) === "}") {
      const parentAttr = get((values as any), value.substring(1, value.length - 1));
      if (typeof parentAttr === "function") {
        const callback = (parentAttr as Function).bind(values);
        if (attributeName === "data-ref") {
          (callback as (...args: any[]) => void)(element);
        } else if (attributeName.indexOf("data-on-") === 0) {
          const eventName = attributeName.substring("data-on-".length);
          element.addEventListener(eventName, (callback as (...args: any[]) => void));
        } else {
          console.error("Cannot use attribute [%s] with function as value. Only data-on-... and data-ref are allowed. Use custom events for using data-on... with custom events or use the helpers .emit and .registerEvent to use custom events.", attributeName);
        }
      }
    }
  }
}

/*
replace "{...}" from string with only string values from values. the value from values is html encoded before being replaced.
 */
function renderTemplate(str: string, values: any): string {
  const re = /{[^}]*}/g;
  return str.replace(re, (match) => {
    const path = match.substring(1, match.length - 1);
    const value = get(values, path);
    if (typeof value === "function") {
      return match; // leave as {name} because renderTemplate doesn't allow functions
    } /*else if (typeof value == "string" || typeof value === "boolean" || typeof value === "number") {
      return encodeHtml(String(value));
      //return String(value);
    }  else if (value == undefined) {
      return "";
    } */ else {
      return encodeHTML(String(value));
    }
  });
}
