import {Component, ComponentState} from "./component.js";

const ShadowRootMap: WeakMap<ShadowRootComponent, ShadowRoot> = new WeakMap<ShadowRootComponent, ShadowRoot>()

export class ShadowRootComponent<S extends ComponentState = ComponentState> extends Component<S> {
  constructor() {
    super();
    const root = this.attachShadow({
      mode: "closed"
    });
    ShadowRootMap.set(this, root);
  }

  protected _renderOnElement(): void {
    const shadow = ShadowRootMap.get(this);
    if (shadow) {
      return super._renderOnElement(shadow);
    }
  }
}

export class OpenShadowRootComponent<S extends ComponentState = ComponentState> extends Component<S> {
  constructor() {
    super();
    this.attachShadow({
      mode: "open"
    });
  }

  protected _renderOnElement(): void {
    return super._renderOnElement(this.shadowRoot as ShadowRoot);
  }
}
