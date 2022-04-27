import {IComponent, nodeList2Array} from "../template/index.js";
import {Selector, Store, StoreListener} from "../store.js";
import {set} from "../template/utils/index.js";
import {render} from "./render-queue.js";

export type ComponentState = { [p: string]: any };

interface ComponentSubscriptionInfo {
  path: string;
  store: Store,
  selector: Selector,
  listener: StoreListener
}

export class Component<S extends ComponentState = ComponentState> extends HTMLElement implements IComponent {

  public state: S;
  public templateChildren: Array<Node | HTMLElement> | undefined;
  public storeListeners: ComponentSubscriptionInfo[] = [];

  constructor() {
    super();
    this.state = {} as S; // start empty
  }

  public subscribe<S, R>(store: Store<S>, path: string, selector: Selector<S, R>) {
    this.storeListeners.push({
      path,
      store,
      selector,
      listener: (value: R) => {
        this.setState(set(this.state, path, value));
      }
    });
  }

  public subscribeAll(): void {
    for (const info of this.storeListeners) {
      info.store.unSubscribe(info.listener);
      set(this.state, info.path, info.store.subscribe(info.selector, info.listener));
    }
  }

  public unSubscribeAll(): void {
    for (const info of this.storeListeners) {
      info.store.unSubscribe(info.listener);
    }
  }

  public connectedCallback(): void {
    this.templateChildren = this.templateChildren ? this.templateChildren : nodeList2Array(this.childNodes);
    this.subscribeAll();
    return this.refresh();
  }

  public disconnectedCallback() {
    return this.unSubscribeAll();
  }

  /*
  will be called before a render if returns true this.render will be called.
   */
  protected didUpdate(oldState: S): boolean {
    return true;
  }

  public render(): string | string[] | void {

  }

  public setState(args: Partial<S>, callback?: () => void): void {
    const oldState = this.state;
    this.state = {
      ...this.state,
      ...args
    };
    if (this.didUpdate(oldState) && this.isConnected) {
      return this.refresh(callback);
    }
  }

  public refresh(callback?: () => void): void {
    return render(this, callback);
  }
}




