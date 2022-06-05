import {Component} from "../component/index.js";
import {historyPushPath} from "./history.js";
import {isPathLocation} from "./utils.js";
import {windowAddEventListener, windowRemoveEventListener} from "../template/utils";

export interface RouteLinkState {
  active?: boolean;
}

export class RouteLink<S extends RouteLinkState = RouteLinkState> extends Component<S> {
  private readonly clickListener: (ev: Event) => void;

  public static tagName: string = "route-link";
  private readonly popStateListener: () => void;

  constructor() {
    super();
    this.popStateListener = () => {
      const isActive = isPathLocation(this.dataset.path);
      if (this.state.active !== isActive) {
        this.setState({
          active: isActive
        } as Partial<S>);
      }
    };
    this.clickListener = (ev) => {
      ev.preventDefault();
      historyPushPath(this.dataset.path as string);
    };
  }

  public connectedCallback() {
    this.addEventListener("click", this.clickListener);
    windowAddEventListener("popstate", this.popStateListener);
    const isActive = isPathLocation(this.dataset.path);
    if (this.state.active !== isActive) {
      this.state.active = isActive;
    }
    return super.connectedCallback();
  }

  public disconnectedCallback() {
    this.removeEventListener("click", this.clickListener);
    windowRemoveEventListener("popstate", this.popStateListener);
  }

  public render() {
    if (this.classList.contains("active") && !this.state.active) {
      this.classList.remove("active");
    } else if (!this.classList.contains("active") && this.state.active) {
      this.classList.add("active");
    }
    return super.render();
  }
}
