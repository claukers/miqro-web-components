import {Component, ComponentState} from "./component.js";
import {renderOnElement} from "./helpers.js";

const ShadowRootMap: WeakMap<ShadowRootComponent, ShadowRoot> = new WeakMap<ShadowRootComponent, ShadowRoot>()

export class ShadowRootComponent<S extends ComponentState = ComponentState> extends Component<S> {
  constructor() {
    super();
    const root = this.attachShadow({
      mode: "closed"
    });
    ShadowRootMap.set(this, root);
  }

  refresh(): void {
    const shadow = ShadowRootMap.get(this);
    if (shadow) {
      return renderOnElement(this, shadow);
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

  refresh(): void {
    return renderOnElement(this, this.shadowRoot as ShadowRoot);
  }
}
