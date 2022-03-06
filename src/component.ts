import {EventCacheEmitter, hookElementEvents, renderTemplate} from "./helpers.js";

export type ComponentState = { [p: string]: any };

export class Component<S extends ComponentState = ComponentState> extends HTMLElement {

  public state: S;
  private readonly _emitter: EventCacheEmitter;

  constructor() {
    super();
    this._emitter = new EventCacheEmitter();
    this.state = {} as S; // start empty
  }

  public connectedCallback() {
    this._renderOnElement();
  }

  /*
  return string to render a template or undefined to render your component using standard api.
   */
  public render(): string | void {
  }

  /*
  will be called before a render if returns true this.render will be called.
   */
  protected didUpdate(oldState: S): boolean {
    return true;
  }

  public emit(event: string): void {
    return this._emitter.emit(event, this);
  }

  public registerEvent(event: string, eventOptions?: EventInit): void {
    return this._emitter.registerEvent(event, eventOptions);
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
    // const {tagName, dataset} = element instanceof HTMLElement ? element : element.host as HTMLElement;
    // console.log("renderOnElement [%s] dataset [%o] state [%o]", tagName, dataset, component.state);
    const renderOutput = this.render();
    if (typeof renderOutput === "string") {
      const rendered = renderTemplate(renderOutput, this);
      if (rendered !== undefined) {
        element.innerHTML = rendered;
        // because innerHTML is replaced we must re-hook events
        const childElements = element.querySelectorAll("*");
        for (let i = 0; i < childElements.length; i++) {
          const child = childElements[i];
          hookElementEvents(child, this);
        }
      }
    }
  }
}
