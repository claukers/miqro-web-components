import {EventCacheEmitter} from "./events.js";
import {renderElementProps, renderOnElement} from "./render.js";

export type ComponentState = { [p: string]: any };

export type ComponentProps = { [p: string]: any };

export class Component<P extends ComponentProps = ComponentProps, S extends ComponentState = ComponentState> extends HTMLElement {

  public props: P;
  public state: S;
  protected readonly _observer: MutationObserver;
  private readonly _emitter: EventCacheEmitter;

  constructor() {
    super();
    this._emitter = new EventCacheEmitter();
    this._observer = new MutationObserver((mutations: MutationRecord[]) => {
      const newProps: any = {};
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const propName = mutation.attributeName;
          if (propName) {
            newProps[propName] = this.getAttribute(propName);
          }
        }
      }
      this.setProps(newProps);
    });
    this.props = renderElementProps(this) as P;
    this.state = {} as S; // start empty
  }

  public connectedCallback() {
    this._observer.observe(this, {
      attributes: true
    });
    this.setProps(renderElementProps(this) as P, false, false);
    this.willMount();
    renderOnElement(this, this);
    this.didMount();
  }

  public disconnectedCallback() {
    this._observer.disconnect();
    this.didUnMount();
  }

  /*
  return string to render a template or undefined to render your component using standard api.
   */
  public render(): string | void {
  }

  /*
  will be called on connectedCallback before render is called
   */
  public willMount() {
  }

  /*
  will be called on connectedCallback after render is called
   */
  public didMount() {
  }

  /*
  will be called on disconnectedCallback after this._observer.disconnect() is called
   */
  public didUnMount() {
  }

  /*
  will be called on after render is called
   */
  public afterRender() {
  }

  public emit(event: string): void {
    return this._emitter.emit(event, this);
  }

  public registerEvent(event: string, eventOptions?: EventInit): void {
    return this._emitter.registerEvent(event, eventOptions);
  }

  public setState(args: Partial<S>, override = false, refresh = true) {
    const oldState = this.state;
    this.state = override ? args as S : {
      ...this.state,
      ...args
    };
    if (refresh && this.isConnected && this.didUpdate(this.props, oldState)) {
      return renderOnElement(this, this);
    }
  }

  public setProps(args: Partial<P>, override = false, refresh = true) {
    const oldProps = this.props;
    this.props = override ? args as P : {
      ...this.props,
      ...args
    };
    if (refresh && this.isConnected && this.didUpdate(oldProps, this.state)) {
      return renderOnElement(this, this);
    }
  }

  protected didUpdate(oldProps: P, oldState: S): boolean {
    return true;
  }
}
