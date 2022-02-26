/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */

function get(obj: any, attrPath: string | any, defaultValue?: any): any | undefined {
  if (!obj || typeof obj !== "object") {
    return defaultValue !== undefined ? defaultValue : undefined
  }
  if (typeof attrPath !== "string") {
    throw new Error(`attrPath must be typeof string`);
  }
  const path = attrPath.split(".").reverse();
  let value = obj;
  while (path.length > 0) {
    const p = path.pop() as string;
    if (value[p] === undefined) {
      return defaultValue !== undefined ? defaultValue : undefined;
    }
    value = value[p];
  }
  return value;
}

export function renderElementProps(element: Element, values?: any): ComponentProps {
  const propNames = element.getAttributeNames();
  const props: ComponentProps = {};
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

function renderTemplate(str: string, values: any): string {
  const re = /{[^}]*}/g;
  return str.replace(re, (match) => {
    const path = match.substring(1, match.length - 1);
    const value = get(values, path);
    if (typeof value === "function") {
      return match; // leave as {name} because renderTemplate doesn't allow functions
    } else if (typeof value == "string" || typeof value === "boolean" || typeof value === "number") {
      return String(value);
    } else if (value == undefined) {
      return "";
    } else {
      return match;
    }
  });
}

export function renderOnElement(component: IComponent, element: Element | ShadowRoot): void {
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
          const asIComponent = (child as unknown as IComponent);
          const objectList = Object.keys(props).filter(p => props[p] && typeof props[p] === "object");
          if (asIComponent.setProps && objectList.length > 0) {
            const newProps: Partial<ComponentProps> = {};
            for (const propName of objectList) {
              newProps[propName] = props[propName];
            }
            asIComponent.setProps(newProps);
          }
          hookElementEvents(child, props);
        }
        if (component.afterRender) {
          component.afterRender();
        }
      }
    }
  }
}

export interface IComponent<P extends ComponentProps = ComponentProps, S extends ComponentState = ComponentState> extends InnerHTML, ParentNode {
  props: P;

  state: S;

  render(): string | void;

  setProps?(props: Partial<P>, override?: boolean): void;

  afterRender?(): void;

}

export type ComponentState = { [p: string]: any };

export type ComponentProps = { [p: string]: any };


