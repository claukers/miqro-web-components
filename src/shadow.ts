import {ComponentProps, ComponentState, renderOnElement} from "./common.js";
import {Component} from "./component.js";

const ShadowRootMap: WeakMap<Component, ComponentState> = new WeakMap<Component, ComponentState>()

export class ShadowRootComponent<P extends ComponentProps = ComponentProps, S extends ComponentState = ComponentState> extends Component<P, S> {
  constructor() {
    super();
    const root = this.attachShadow({
      mode: "closed"
    });
    ShadowRootMap.set(this, root);
  }

  protected _renderOnElement(): void {
    const shadowRoot = ShadowRootMap.get(this);
    return renderOnElement(this, shadowRoot as ShadowRoot);
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
