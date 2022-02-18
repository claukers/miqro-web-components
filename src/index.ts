/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
function get(obj: any, attrPath: string, defaultValue?: any): any | undefined {
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

function renderElementProps(element: Element, values?: any, override = false): { [attr: string]: string | Function; } {
  const propNames = element.getAttributeNames();
  const props: { [attr: string]: string | Function; } = {};
  for (const propName of propNames) {
    const value = element.getAttribute(propName);
    if (values && value && value[0] === "{" && value[value.length - 1] === "}") {
      const parentAttr = get((values as any), value.substring(1, value.length - 1));
      if (typeof parentAttr === "function") {
        const fn = parentAttr as Function;
        props[propName] = fn.bind(values) as Function;
      } else {
        props[propName] = parentAttr;
        if (override) {
          element.setAttribute(propName, String(parentAttr));
        }
      }
    } else if (value) {
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
        element.addEventListener(eventName, async (...args: any[]) => {
          await (propValue as (...args: any[]) => void)(...args);
        });
      } else {
        console.error("Cannot use attribute [%s] with function as value. Only data-on-... and data-ref are allowed. Use custom events for using data-on... with custom events.", prop);
      }
    }
  }
}

function renderTemplate(str: string, values: any): string {
  const re = /{(\w+)(\.\w+)*\}/g;
  return str.replace(re, (match) => {
    const path = match.substring(1, match.length - 1);
    const value = get(values, path);
    if (typeof value === "function") {
      return match;
    } else {
      return String(value);
    }
  });
}

function renderWebComponent(component: IWebComponent): string | void {
  const renderOutput = component.render();
  if (typeof renderOutput === "string") {
    return renderTemplate(renderOutput, component);
  }
}

export function renderOnElement(component: IWebComponent, element: Element | ShadowRoot): void {
  console.log("renderOnElement [%s] props [%o] state [%o]", element.nodeName, component.props, component.state);
  const rendered = renderWebComponent(component);
  if (rendered !== undefined) {
    element.innerHTML = rendered;
    // because innerHTML is replace we must re-hook events
    const childElements = element.querySelectorAll("*");
    for (let i = 0; i < childElements.length; i++) {
      const child = childElements[i];
      const props = renderElementProps(child, component);
      hookElementEvents(child, props);
    }
    hookElementEvents(element, component.props);
  }
}

interface IWebComponent extends InnerHTML, ParentNode {
  props: { [p: string]: string };

  state: { [p: string]: any };

  render(): string | void;
}

type WebComponentState = { [p: string]: any };

type WebComponentProps = { [p: string]: string };

export class WebComponent extends HTMLElement implements IWebComponent {

  props: WebComponentProps;
  state: WebComponentState;
  private readonly observer: MutationObserver;

  constructor() {
    super();
    this.observer = new MutationObserver((arg) => {
      console.log("observer " + this.tagName);
      console.dir(arg);
      if (this.isConnected) {
        const oldProps = this.props;
        this.props = renderElementProps(this) as { [p: string]: string };
        if (this.didUpdate(oldProps, this.state)) {
          return this.renderOnElement();
        }
      }
    });
    this.observer.observe(this, {
      attributes: true
    });
    this.props = renderElementProps(this) as { [p: string]: string };
    this.state = {};
    console.log("ctor " + this.tagName);
    console.dir(this.props);
  }

  connectedCallback() {
    console.log("connected " + this.tagName);
    this.props = renderElementProps(this) as { [p: string]: string };
    return this.renderOnElement();
  }

  adoptedCallback() {
    // return this.renderOnElement();
    console.log("adopted " + this.tagName);
  }

  disconnectedCallback() {
    console.log("disconnected " + this.tagName);
  }

  render(): string | void {
  }

  protected setState(args: Partial<WebComponentState>) {
    const oldState = this.state;
    this.state = {
      ...this.state,
      ...args
    };
    if (this.didUpdate(this.props, oldState)) {
      return this.renderOnElement();
    }
  }

  renderOnElement(): void {
    return renderOnElement(this, this);
  }

  didUpdate(oldProps: WebComponentProps, oldState: WebComponentState): boolean {
    return true;
  }
}

export class ShadowRootWebComponent extends WebComponent {
  private readonly root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({
      mode: "closed"
    });
  }

  renderOnElement(element?: Element) {
    return renderOnElement(this, this.root);
  }
}
