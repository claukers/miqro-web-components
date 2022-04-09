import {Component, ComponentState} from "../component/index.js";
import {historyPushPath} from "./history.js";
import {isPathLocation} from "./utils.js";

export interface RouteLinkState extends ComponentState {
  active?: boolean;
}

export class RouteLink<S extends RouteLinkState = RouteLinkState> extends Component<S> {
  private readonly clickListener: (ev: Event) => void;

  public static tagName: string = "route-link";

  constructor() {
    super();
    this.clickListener = (ev) => {
      ev.preventDefault();
      if (!this.state.active) {
        this.setState({
          active: true
        } as Partial<S>);
      }
      historyPushPath(this.dataset.path as string);
    };
  }

  public connectedCallback() {
    this.addEventListener("click", this.clickListener);
    const isActive = isPathLocation(this.dataset.path);
    if (this.state.active !== isActive) {
      this.state.active = isActive;
    }
    return super.connectedCallback();
  }

  public disconnectedCallback() {
    this.removeEventListener("click", this.clickListener);
  }

  public render(): string[] | string | void {
    if (this.classList.contains("active") && !this.state.active) {
      this.classList.remove("active");
    } else if (!this.classList.contains("active") && this.state.active) {
      this.classList.add("active");
    }
    return super.render();
  }
}
