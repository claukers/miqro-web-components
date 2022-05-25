import {set, ComponentState, IComponent, nodeList2Array} from "./template/index.js";
import {Selector, Store, StoreListener} from "../store.js";
import {render} from "./render-queue.js";
import {dispose} from "./render.js";

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
    this.state = Object.create(null) as S; // start empty
  }

  public subscribe<S, R>(store: Store<S>, path: string, selector: Selector<S, R>) {
    set(this.state, path, selector(store.getState()));
    this.storeListeners.push({
      path,
      store,
      selector,
      listener: (value: R) => {
        this.setState(set({...this.state}, path, value));
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
    dispose(this);
    return this.unSubscribeAll();
  }

  public render(): Promise<string> | string | void {

  }

  protected didUpdate(oldState: S): boolean {
    return true;
  }

  public setState(args: Partial<S>, callback?: () => void): void {
    const oldState = {...this.state};
    this.state = {
      ...this.state,
      ...args
    };
    const asIComponent = this as IComponent;
    if (this.didUpdate(oldState) && this.isConnected) {
      this.refresh(callback);
    }
    if (asIComponent.stateChangedCallback) {
      try {
        asIComponent.stateChangedCallback(oldState);
      } catch (e) {
        console.error(e);
      }
    }
    return;
  }

  public refresh(callback?: () => void): void {
    if (!this.isConnected) {
      return;
    }
    return render(this, undefined, {
      this: this,
      children: this.templateChildren ? this.templateChildren : []
    }, callback);
  }
}




