import {log, LOG_LEVEL} from "./log.js";
import {mapDelete, mapGet, mapKeys, mapSet} from "./template/utils";

export interface Action {
  type: string;
}

export type Selector<S = any, R = any> = (state: S) => R;
export type StoreListener<S = any, R = any> = (value: R) => void;
export type Reducer<A extends Action = Action, S = any> = (action: A, state: S) => S;

export interface StoreReducerMap {
  [actionName: string]: Reducer<any, any>;
}

export interface StoreOptions {
  dispatchTimeout?: number;
}

export class Store<S = any> extends EventTarget {
  private readonly listenerMap: Map<StoreListener<S>, ListenerInfo<S>>;
  private triggerListenerTimeout?: any;
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
    mapSet.call(this.listenerMap, listener, {lastResult, selector});
    return lastResult;
  }

  public unSubscribe<R = any>(listener: StoreListener<S, R>): boolean {
    return mapDelete.call(this.listenerMap, listener);
  }

  public getState(): S {
    return {...this.state};
  }

  public dispatch(action: Action): void {
    const oldState = this.getState();
    this.state = typeof this.reducers === "function" ?
      this.reducers(action, oldState) :
      (this.reducers[action.type] ? this.reducers[action.type](action, oldState) : oldState);

    clearTimeout(this.triggerListenerTimeout);

    if (oldState !== this.state) {
      this.triggerListenerTimeout = setTimeout(() => triggerListeners<S>(this, action, this.listenerMap), this.options.dispatchTimeout);
    }
  }
}

interface ListenerInfo<S = any> {
  lastResult: any;
  selector: Selector<S>;
}

function triggerListeners<S = any>(store: Store, action: Action, listenerMap: Map<StoreListener<S>, ListenerInfo<S>>): void {
  const state = store.getState();
  const listeners = mapKeys.call(listenerMap) as IterableIterator<StoreListener<S>>;
  for (const listener of listeners) {
    const listenerInfo = mapGet.call(listenerMap, listener) as ListenerInfo<S> | undefined;
    if (listenerInfo) {
      try {
        const result = listenerInfo.selector(state);
        if (result !== listenerInfo.lastResult) {
          log(LOG_LEVEL.trace, "dispatch listener");
          listenerInfo.lastResult = result;
          listener(result);
        }
      } catch (e) {
        log(LOG_LEVEL.error, e);
        store.dispatchEvent(new ErrorEvent(String(e) + " " + String((e as Error).stack)));
      }
    }
  }
}
