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
    console.log("shadow reload");
    const shadow = ShadowRootMap.get(this) as ShadowRoot;
    if (shadow) {
      return renderOnElement(this, shadow);
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
