import {Selector, Store} from "../store.js";
import {RenderFunction} from "../template/index.js";
import { RenderFunctionArgs } from "../template/utils/template.js";

export interface FunctionComponentMeta {
  templateChildren?: Node[];
  func: RenderFunction;
  shadowRoot?: ShadowRoot;
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
export type GetFunction<T = any> = () => T;

export type UseStateFunction<T = any> = (defaultValue?: T) => [T | undefined, SetFunction<T>, GetFunction<T>];
export type UseEffectFunction = (effect: Effect) => void;
export type UseAttributeFunction = (name: string, defaultValue?: string) => string | undefined | null;
export type UseQueryFunction = (name: string, defaultValue?: string | string[]) => [string[] | string | null, SetFunction<string[] | string | null>];
export type UseSubscriptionFunction<R = any> = <R, S>(store: Store, selector: Selector<S, R>) => R | undefined;

export interface ContextCall {
  call: string;
  firstRun: boolean;
  name: string;
}

export interface FunctionComponentThis {
  useState: UseStateFunction;
  useEffect: UseEffectFunction;
  useAttribute: UseAttributeFunction;
  useQuery: UseQueryFunction;
  useSubscription: UseSubscriptionFunction;
  element: HTMLElement;
  [name: string]: any;
}

export interface FunctionComponentContext {
  this: FunctionComponentThis;
  validateAndLock: () => void;
}

export type UseFunctionCB<R = any> = (element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, ...args: any[]) => R;

export interface UseFunction<R = any> extends UseFunctionCB<R>, FunctionComponentThis{
  
}
