import {Selector, Store} from "../store.js";
import {RenderFunction} from "../template/index.js";

export interface FunctionComponentMeta {
  func: RenderFunction;
  shadowRoot: ShadowRoot;
  state: {
    [key: string]: any;
  };
  effects: Effect[];
  disconnectCallbacks: (() => void)[];
  queryWatch: {
    name: string;
    lastValue: string | string[] | null;
  }[];
  attributeWatch: string[];
  contextCalls: ContextCall[];
  refresh: () => void;
}

export type Effect = () => undefined | (() => void);
export type SetFunction<T = any> = (newValue: T) => void;

export type UseStateFunction<T = any> = (defaultValue?: T) => [T | undefined, SetFunction<T>];
export type UseEffectFunction = (effect: Effect) => void;
export type UseAttributeFunction = (name: string, defaultValue?: string) => string | undefined | null;
export type UseQueryFunction = (name: string, defaultValue?: string | string[]) => [string[] | string | null, SetFunction<string[] | string | null>];
export type UseSubscriptionFunction<R = any> = <S, R>(store: Store, selector: Selector<S, R>) => R | undefined;

export interface ContextCall {
  call: string;
  firstRun: boolean;
  name: string;
}

export interface FunctionComponentContext {
  this: {
    useState: UseStateFunction;
    useEffect: UseEffectFunction;
    useAttribute: UseAttributeFunction;
    useQuery: UseQueryFunction;
    useSubscription: UseSubscriptionFunction;
  },
  validateAndLock: () => void;
}

export type UseFunction<R = any> = (element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, ...args: any[]) => R;
