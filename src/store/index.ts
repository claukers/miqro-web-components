import {
  Action,
  deepEquals,
  IStore,
  mapDelete,
  mapGet,
  mapKeys,
  mapSet,
  Reducer,
  Selector,
  StoreListener,
  StoreOptions,
  StoreReducerMap
} from "../common/index.js";

export class Store<S = any> extends EventTarget implements IStore {
  private readonly listenerMap: Map<StoreListener<S>, ListenerInfo<S>>;
  private triggerListenerTimeout?: any;
  private options: { dispatchTimeout: number };

  constructor(protected reducers: StoreReducerMap<S> | Reducer<Action, S>, protected state: S, options?: StoreOptions) {
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
    return this.queueTrigger();
  }

  protected queueTrigger(): void {
    clearTimeout(this.triggerListenerTimeout);
    this.triggerListenerTimeout = setTimeout(() => triggerListeners<S>(this, this.listenerMap), this.options.dispatchTimeout);
  }
}

interface ListenerInfo<S = any> {
  lastResult: any;
  selector: Selector<S>;
}

function triggerListeners<S = any>(store: Store, listenerMap: Map<StoreListener<S>, ListenerInfo<S>>): void {
  const state = store.getState();
  const listeners = mapKeys.call(listenerMap) as IterableIterator<StoreListener<S>>;
  for (const listener of listeners) {
    const listenerInfo = mapGet.call(listenerMap, listener) as ListenerInfo<S> | undefined;
    if (listenerInfo) {
      try {
        const result = listenerInfo.selector(state);
        //log(LOG_LEVEL.trace, "dispatch listener check %s !== %s", result, listenerInfo.lastResult);
        if (!deepEquals(result, listenerInfo.lastResult)) {
          //log(LOG_LEVEL.trace, "dispatch listener");
          listenerInfo.lastResult = result;
          listener(result);
        }
      } catch (e) {
        //log(LOG_LEVEL.error, e);
        store.dispatchEvent(new ErrorEvent(String(e) + " " + String((e as Error).stack)));
      }
    }
  }
}
