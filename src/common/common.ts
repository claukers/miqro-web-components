export const URLSearchParamsGetAll = URLSearchParams.prototype.getAll;
export const URLSearchParamsSet = URLSearchParams.prototype.set;
export const URLSearchParamsAppend = URLSearchParams.prototype.append;
export const URLSearchParamsDelete = URLSearchParams.prototype.delete;
//export const URLSearchParamsToString = URLSearchParams.prototype.toString;

export const mutationObserverObserve = MutationObserver.prototype.observe;
export const mutationObserverDisconnect = MutationObserver.prototype.disconnect;

export const windowDispatchEvent = window.dispatchEvent;
export const windowAddEventListener = window.addEventListener;
export const windowRemoveEventListener = window.removeEventListener;

export const weakMapGet = WeakMap.prototype.get;
export const weakMapHas = WeakMap.prototype.has;
export const weakMapSet = WeakMap.prototype.set;
export const weakMapDelete = WeakMap.prototype.delete;

export const mapKeys = Map.prototype.keys;
export const mapGet = Map.prototype.get;
//export const mapHas = Map.prototype.has;
export const mapSet = Map.prototype.set;
export const mapDelete = Map.prototype.delete;

export interface RenderFunctionOptions {
  shadowInit: ShadowRootInit | boolean;
  template: string;
}

export interface RenderFunctionWithOptions extends RenderFunctionOptions {
  render: RenderFunction;
}

export interface TemplateValues {
  [key: string]: any;
}

export interface RenderTemplateArgs {
  template: string;
  values: TemplateValues;
}

export type RenderFunctionOutput = Partial<RenderTemplateArgs> | string | undefined | void;

export interface RenderFunctionArgs {
  abortController: AbortController;
}

export type RenderFunction = (args: RenderFunctionArgs) => Promise<RenderFunctionOutput> | RenderFunctionOutput;

export type RenderEventListener = (evt: CustomEvent<AbortSignal>) => void;

export interface RenderFunctionMeta {
  lock: boolean;
  template?: string;
  templateChildren?: Node[];
  func: RenderFunction;
  shadowRoot?: ShadowRoot;
  state: {
    [key: string]: any;
  };
  observer: MutationObserver;
  mountEffects: Effect[];
  mountEffectCallbacks: Effect[];
  effects: Effect[];
  effectCallbacks: (() => void)[];
  queryWatch: string[];
  attributeWatch: string[];
  contextCalls: ContextCall[];
  refresh: (firstRun?: boolean) => void;
  renderCallback: () => void;
  templateValues: {
    [key: string]: any
  }
}

export type Effect = () => undefined | (() => void) | void;
export type SetFunction<T = any> = (newValue: T) => void;
export type GetFunction<T = any> = () => T;

export type UseStateFunction<T = any> = (defaultValue?: T) => [T | undefined, SetFunction<T>, GetFunction<T>];
export type UseAsFunction<T = any> = (name: string, value: T) => void;
export type UseEffectFunction = (effect: Effect) => void;
export type UseAttributeFunction = (name: string, defaultValue?: string, watch?: boolean) => string | undefined | null;
export type UseJSONAttributeFunction<T = any> = (name: string, defaultValue?: T) => T | undefined | null;
export type UseQueryFunction = (name: string, defaultValue?: string | string[]) => [string[] | string | null, SetFunction<string[] | string | null>];
export type UseSubscriptionFunction<R = any> = <R, S>(store: IStore<S>, selector: Selector<S, R>) => R | undefined;

export interface ContextCall {
  call: string;
  lastValue?: any;
  firstRun: boolean;
  name: string;
  checkChanged?: () => { shouldAbort: boolean; shouldRefresh: boolean; };
}

export interface RenderFunctionThis {
  useState: UseStateFunction;
  useAs: UseAsFunction;
  useEffect: UseEffectFunction;
  useMountEffect: UseEffectFunction;
  useAttribute: UseAttributeFunction;
  useJSONAttribute: UseJSONAttributeFunction;
  useQuery: UseQueryFunction;
  useSubscription: UseSubscriptionFunction;
  element: HTMLElement;
  shadowRoot?: ShadowRoot;

  [name: string]: any;
}

export interface RenderContext {
  this: RenderFunctionThis;
  validateAndLock: () => void;
}

export type UseFunctionCB<R = any> = (element: HTMLElement, context: ContextCall, meta: RenderFunctionMeta, renderArgs: RenderFunctionArgs, ...args: any[]) => R;

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

export interface IStore<S = any> {
  subscribe<R>(selector: Selector<S, R>, listener: StoreListener<S, R>): R;

  unSubscribe<R>(listener: StoreListener<S, R>): boolean;

  dispatch(action: Action): void;

  getState(): S;
}
