import {log, LOG_LEVEL, mapDelete, mapGet, mapKeys, mapSet} from "./utils.js";

export interface Action {
  type: string;

  [attr: string]: any;
}

export type Selector<S = any, R = any> = (state: S) => R;
export type StoreListener<S = any, R = any> = (value: R) => void;
export type Reducer<A extends Action = Action, S = any> = (action: A, state: S) => S;

export interface StoreReducerMap<S> {
  [actionName: string]: Reducer<Action, S>;
}

export interface StoreOptions {
  dispatchTimeout?: number;
}

export class Store<S = any> extends EventTarget {
  private readonly listenerMap: Map<StoreListener<S>, ListenerInfo<S>>;
  private triggerListenerTimeout?: any;
  private options: { dispatchTimeout: number };

  constructor(private reducers: StoreReducerMap<S> | Reducer, private state: S, options?: StoreOptions) {
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

    //if (oldState !== this.state) {
    this.triggerListenerTimeout = setTimeout(() => triggerListeners<S>(this, action, this.listenerMap), this.options.dispatchTimeout);
    //}
  }
}

export function deepEquals(A: any, B: any): boolean {
  log(LOG_LEVEL.trace, "deepCompare(%o, %o)", A, B);
  if ((A === null && B !== null) || (B === null && A !== null)) {
    log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if ((A === undefined && B !== undefined) || (B === undefined && A !== undefined)) {
    log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if (A === null && B === null) {
    log(LOG_LEVEL.trace, "deepCompare(%o, %o)=true", A, B);
    return true;
  }
  if (A === undefined && B === undefined) {
    log(LOG_LEVEL.trace, "deepCompare(%o, %o)=true", A, B);
    return true;
  }
  if (typeof A !== typeof B) {
    log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if (A.prototype !== B.prototype || A.__proto__ !== B.__proto__) {
    log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
    return false;
  }
  if (A instanceof Date && B instanceof Date) {
    return A.getTime() === B.getTime();
  }
  if (typeof A === "object") {
    const aKeys = Object.keys(A);
    const bKeys = Object.keys(B);
    if (aKeys.length !== bKeys.length) {
      log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
      return false;
    }
    for (const i of aKeys) {
      if (A[i] !== B[i]) {
        const vA = A[i];
        const vB = B[i];
        if (!deepEquals(vA, vB)) {
          log(LOG_LEVEL.trace, "deepCompare(%o, %o)=false", A, B);
          return false;
        }
      }
    }
  }

  switch (typeof A) {
    case "object":
      return true;
    case "number":
    case "bigint":
    case "boolean":
    case "function":
    case "symbol":
    case "string":
    case "undefined":
      const ret = A === B;
      log(LOG_LEVEL.trace, "deepCompare(%o, %o)=%s", A, B, ret);
      return ret;
  }
  log(LOG_LEVEL.trace, "deepCompare(%o, %o)=true", A, B);
  return true;
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
        log(LOG_LEVEL.trace, "dispatch listener check %s !== %s", result, listenerInfo.lastResult);
        if (!deepEquals(result, listenerInfo.lastResult)) {
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
