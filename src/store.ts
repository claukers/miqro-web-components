export type Selector<S = any, R = any> = (state: S) => R;
export type StoreListener<S = any, R = any> = (value: R) => void;
export type Reducer<S = any> = (action: Action, state: S) => S;

export interface Action {
  type: string;
}

export interface StoreReducerMap {
  [actionName: string]: Reducer;
}

export interface StoreOptions {
  dispatchTimeout?: number;
}

export class Store<S = any> extends EventTarget {
  private readonly listenerMap: Map<StoreListener<S>, ListenerInfo<S>>;
  private dispatchTimeout?: any;
  private options: { dispatchTimeout: number };

  constructor(private reducers: StoreReducerMap | Reducer, private state: S, options?: StoreOptions) {
    super();
    this.listenerMap = new Map<StoreListener<S>, ListenerInfo<S>>();
    this.options = {
      dispatchTimeout: 0,
      ...(options ? options : {})
    };
  }

  public subscribe<R = any>(selector: Selector<S, R>, listener: StoreListener<S, R>): R {
    const lastResult = selector(this.state);
    this.listenerMap.set(listener, {lastResult, selector});
    return lastResult;
  }

  public unSubscribe<R = any>(listener: StoreListener<S, R>): boolean {
    return this.listenerMap.delete(listener);
  }

  public getState(): S {
    return {...this.state};
  }

  public dispatch(action: Action): void {
    const oldState = this.getState();
    this.state = typeof this.reducers === "function" ?
      this.reducers(action, oldState) :
      (this.reducers[action.type] ? this.reducers[action.type](action, oldState) : oldState);

    clearTimeout(this.dispatchTimeout);

    if (oldState !== this.state) {
      this.dispatchTimeout = setTimeout(() => dispatch<S>(this, action, this.listenerMap), this.options.dispatchTimeout);
    }
  }
}

interface ListenerInfo<S = any> {
  lastResult: any;
  selector: Selector<S>;
}

function dispatch<S = any>(store: Store, action: Action, listenerMap: Map<StoreListener<S>, ListenerInfo<S>>): void {
  const state = store.getState();
  const listeners = listenerMap.keys();
  for (const listener of listeners) {
    const listenerInfo = listenerMap.get(listener);
    if (listenerInfo) {
      try {
        const result = listenerInfo.selector(state);
        if (result !== listenerInfo.lastResult) {
          console.log("dispatch listener");
          listenerInfo.lastResult = result;
          listener(result);
        }
      } catch (e) {
        console.error(e);
        store.dispatchEvent(new ErrorEvent(String(e) + " " + String((e as Error).stack)));
      }
    }
  }
}
