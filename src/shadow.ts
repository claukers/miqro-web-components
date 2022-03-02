import {Component, ComponentProps, ComponentState} from "./component.js";
import {renderElementProps, renderOnElement} from "./helpers.js";

const ShadowRootMap: WeakMap<ShadowRootComponent, ShadowRoot> = new WeakMap<ShadowRootComponent, ShadowRoot>()

export class ShadowRootComponent<P extends ComponentProps = ComponentProps, S extends ComponentState = ComponentState> extends Component<P, S> {
  constructor() {
    super();
    const root = this.attachShadow({
      mode: "closed"
    });
    ShadowRootMap.set(this, root);
  }

  public connectedCallback() {
    const shadowRoot = ShadowRootMap.get(this);
    this._observer.observe(this, {
      attributes: true
    });
    this.setProps(renderElementProps(this) as P, false, false);
    this.willMount();
    renderOnElement(this, shadowRoot as ShadowRoot);
    this.didMount();
  }

  setState(args: Partial<S>, override: boolean = false, refresh: boolean = true): void {
    const oldState = this.state;
    super.setState(args, override, false);
    const shadowRoot = ShadowRootMap.get(this);
    if (shadowRoot && refresh && this.isConnected && this.didUpdate(this.props, oldState)) {
      return renderOnElement(this, shadowRoot);
    }
  }

  setProps(args: Partial<P>, override: boolean = false, refresh: boolean = true): void {
    const oldProps = this.props;
    super.setProps(args, override, false);
    const shadowRoot = ShadowRootMap.get(this);
    if (shadowRoot && refresh && this.isConnected && this.didUpdate(oldProps, this.state)) {
      return renderOnElement(this, shadowRoot);
    }
  }
}

export class OpenShadowRootComponent extends ShadowRootComponent {
  constructor() {
    super();
    const root = this.attachShadow({
      mode: "open"
    });
    ShadowRootMap.set(this, root);
  }
}
