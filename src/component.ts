import {ComponentProps, ComponentState, IComponent, renderElementProps, renderOnElement} from "./common.js";
import {EventEmitter, IEventEmitter} from "./events.js";

export class Component<P extends ComponentProps = ComponentProps, S extends ComponentState = ComponentState> extends HTMLElement implements IComponent<P, S>, IEventEmitter {

  public props: P;
  public state: S;
  protected readonly _observer: MutationObserver;
  private readonly _emitter: EventEmitter;

  constructor() {
    super();
    this._emitter = new EventEmitter();
    this._observer = new MutationObserver((arg) => {
      this.setProps(renderElementProps(this) as P, true);
    });
    this._observer.observe(this, {
      attributes: true
    });
    this.props = renderElementProps(this) as P;
    this.state = {} as S; // start empty
  }

  public connectedCallback() {
    this._observer.observe(this, {
      attributes: true
    });
    this.willMount();
    this._renderOnElement();
    this.didMount();
  }

  disconnectedCallback() {
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

  public setState(args: Partial<S>) {
    const oldState = this.state;
    this.state = {
      ...this.state,
      ...args
    };
    if (this.isConnected && this.didUpdate(this.props, oldState)) {
      return this._renderOnElement();
    }
  }

  public setProps(args: Partial<P>, override = false) {
    const oldProps = this.props;
    this.props = override ? args as P : {
      ...this.props,
      ...args
    };
    if (this.isConnected && this.didUpdate(oldProps, this.state)) {
      return this._renderOnElement();
    }
  }

  protected didUpdate(oldProps: P, oldState: S): boolean {
    return true;
  }

  protected _renderOnElement(): void {
    return renderOnElement(this, this);
  }
}