import {EventEmitter, getTagName, renderComponentOnElement} from "./helpers.js";
import {TemplateLoader} from "./template";

export type ComponentState = { [p: string]: any };

export class Component<S extends ComponentState = ComponentState> extends HTMLElement {

  public state: S;
  private readonly _emitter: EventEmitter;

  constructor() {
    super();
    this._emitter = new EventEmitter();
    this.state = {} as S; // start empty
  }

  public connectedCallback() {
    this._renderOnElement();
  }

  /*
  return string to render a template or undefined to render your component using standard api.
   */
  public render(): string[] | string | void {
  }

  /*
  will be called before a render if returns true this.render will be called.
   */
  protected didUpdate(oldState: S): boolean {
    return true;
  }

  public emit(event: string, args?: any, eventOptions?: EventInit): void {
    return this._emitter.emit(event, args, this);
  }

  public setState(args: Partial<S>, refresh = true) {
    const oldState = this.state;
    this.state = {
      ...this.state,
      ...args
    };
    if (refresh && this.isConnected && this.didUpdate(oldState)) {
      return this._renderOnElement();
    }
  }

  protected _renderOnElement(element: HTMLElement | ShadowRoot = this) {
    return renderComponentOnElement(this, element);
  }

  public static define(component: {
    new(...params: any[]): Component;
    tagName?: string;
    template?: string;
  }, template?: string, override: boolean = false): void {
    const tagName = getTagName(component);
    // console.log(`define tag [${tagName}]`);
    try {
      if (!customElements.get(tagName) || override) {
        template = template ? template : component.hasOwnProperty("template") ? component.template : undefined;
        if (typeof template === "string") {
          const t = template;
          customElements.define(tagName, class extends component {
            constructor() {
              super();
              this.render = () => {
                return TemplateLoader.renderTemplate(this, t);
              };
            }
          });
        } else {
          customElements.define(tagName, component);
        }
      }
    } catch (e) {
      console.error(`cannot define tag ${tagName}`)
      throw e;
    }
  }
}
