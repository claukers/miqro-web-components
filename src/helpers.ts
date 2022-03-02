import {get, parse} from "@miqro/parser";

export function decodeHtml(str: string) {
  return parse(str, "decodeHtml");
}

export function encodeHtml(str: string) {
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

  setProps?(props: any): void;

  afterRender?(): void;

}, element: Element | ShadowRoot): void {
  // console.log("renderOnElement [%s] props [%o] state [%o]", element.nodeName, component.props, component.state);
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
          const props = renderElementProps(child, component);
          // only call setProps when object or function is set
          const asIComponent = (child as unknown as any);
          if (asIComponent.setProps) {
            const objectList = Object.keys(props).filter(p => props[p] && typeof props[p] === "object");
            if (objectList.length > 0) {
              console.warn("%s passing objects to children on props is not recommended", element.nodeName);
              const newProps: Partial<{ [p: string]: any }> = {};
              for (const propName of objectList) {
                newProps[propName] = props[propName];
              }
              asIComponent.setProps(newProps);
            }
          }
          hookElementEvents(child, props);
        }
        if (component.afterRender) {
          component.afterRender();
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
export function renderElementProps(element: Element, values?: any): { [p: string]: any } {
  const propNames = element.getAttributeNames();
  const props: { [p: string]: any } = {};
  for (const propName of propNames) {
    const value = element.getAttribute(propName);
    if (values && value && value.charAt(0) === "{" && value.charAt(value.length - 1) === "}") {
      const parentAttr = get((values as any), value.substring(1, value.length - 1));
      if (typeof parentAttr === "function") {
        const fn = parentAttr as Function;
        props[propName] = fn.bind(values) as Function;
      } else if (parentAttr !== undefined) {
        props[propName] = parentAttr;
      }
    } else if (value !== undefined && value !== null) {
      props[propName] = value;
    }
  }
  return props;
}

/*
hooks data-ref and data-on-... for Components
 */
function hookElementEvents(element: Element | ShadowRoot, p: { [attr: string]: string | Function; }): void {
  const props = Object.keys(p);
  for (const prop of props) {
    const propValue = p[prop];
    if (typeof propValue === "function") {
      if (prop === "data-ref") {
        (propValue as (...args: any[]) => void)(element);
      } else if (prop.indexOf("data-on-") === 0) {
        const eventName = prop.substring("data-on-".length);
        element.addEventListener(eventName, (propValue as (...args: any[]) => void));
      } else {
        console.error("Cannot use attribute [%s] with function as value. Only data-on-... and data-ref are allowed. Use custom events for using data-on... with custom events or use the helpers .emit and .registerEvent to use custom events.", prop);
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
    } else if (typeof value == "string" || typeof value === "boolean" || typeof value === "number") {
      return encodeHtml(String(value));
      //return String(value);
    } else if (value == undefined) {
      return "";
    } else {
      return match;
    }
  });
}
