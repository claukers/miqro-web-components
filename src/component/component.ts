import {disconnect, nodeList2Array, render, set, TemplateValues} from "../template/index.js";
import {Selector, Store, StoreListener} from "../store.js";

interface ComponentSubscriptionInfo {
  path: string;
  store: Store,
  selector: Selector,
  listener: StoreListener
}

export class Component<S extends TemplateValues = TemplateValues> extends HTMLElement {

  public state: S;
  protected templateChildren: Array<Node | HTMLElement> | undefined;
  protected storeListeners: ComponentSubscriptionInfo[] = [];

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
    disconnect(this);
    return this.unSubscribeAll();
  }

  public render(): Promise<string | undefined> | string | void {

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
    if (this.didUpdate(oldState) && this.isConnected) {
      this.refresh(callback);
    }
    return;
  }

  public refresh(callback?: () => void): void {
    if (!this.isConnected) {
      return;
    }
    return render(this,
      this.constructor.hasOwnProperty("template") ? `<!--{${(this.constructor as any).template}}-->` : this.render(),
      {
        this: this,
        children: this.templateChildren ? this.templateChildren : []
      }, callback);
  }
}



