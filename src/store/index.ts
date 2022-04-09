export type Selector<S = any> = (state: S) => any;
export type StoreListener<S = any> = (value: any) => void;
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

export class Store<S = any> {
  private readonly listenerMap: Map<StoreListener<S>, ListenerInfo<S>>;
  private dispatchTimeout?: any;
  private options: { dispatchTimeout: number };

  constructor(private reducers: StoreReducerMap | Reducer, private state: S, options?: StoreOptions) {
    this.listenerMap = new Map<StoreListener<S>, ListenerInfo<S>>();
    this.options = {
      dispatchTimeout: 0,
      ...(options ? options : {})
    };
  }

  public subscribe(selector: Selector<S>, listener: StoreListener<S>): any {
    const lastResult = selector(this.state);
    this.listenerMap.set(listener, {lastResult, selector});
    return lastResult;
  }

  public unSubscribe(listener: StoreListener<S>): boolean {
    return this.listenerMap.delete(listener);
  }

  public getState(): S {
    return {...this.state};
  }

  public dispatch(action: Action) {
    const oldState = this.getState();
    this.state = typeof this.reducers === "function" ?
      this.reducers(action, oldState) :
      (this.reducers[action.type] ? this.reducers[action.type](action, oldState) : oldState);

    clearTimeout(this.dispatchTimeout);

    if (oldState !== this.state) {
      this.dispatchTimeout = setTimeout(() => dispatch(action, this.getState(), this.listenerMap), this.options.dispatchTimeout);
    }
  }
}

interface ListenerInfo<S = any> {
  lastResult: any;
  selector: Selector<S>;
}

function dispatch<S = any>(action: Action, state: S, listenerMap: Map<StoreListener<S>, ListenerInfo<S>>): void {
  const listeners = listenerMap.keys();
  for (const listener of listeners) {
    const listenerInfo = listenerMap.get(listener);
    if (listenerInfo) {
      try {
        const result = listenerInfo.selector(state);
        if (result !== listenerInfo.lastResult) {
          listenerInfo.lastResult = result;
          listener(result);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
