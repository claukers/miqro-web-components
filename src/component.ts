import {EventCacheEmitter, renderOnElement} from "./helpers.js";

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
    this.refresh();
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
      return this.refresh();
    }
  }

  public refresh() {
    return renderOnElement(this, this);
  }
}
