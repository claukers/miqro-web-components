import {Effect, FunctionMeta, RenderContext, SetFunction} from "./common.js";
import {Selector, Store} from "../store.js";
import {log, LOG_LEVEL} from "../log.js";

export function setupObserver(element: HTMLElement, meta: FunctionMeta) {
  meta.observer.disconnect();
  meta.observer.observe(element, {
    attributes: true,
    attributeFilter: meta.attributeFilter
  });
}

export function getRenderContext(element: HTMLElement, meta: FunctionMeta, firstRun: boolean, refresh: () => void): RenderContext {
  let valueKeyAccess = 0;
  let lockUseState = false;
  let lock = false;
  const count = meta.componentValues.length;
  const effects: Effect[] = [];

  function useQuery(name: string, defaultValue?: string | string[]): [string[] | string | null, SetFunction<string[] | string | null>] {
    if (lock) {
      throw new Error("cannot use useQuery after render!");
    }
    //lockUseState = true;
    const searchParams = new URL(window.location.toString()).searchParams;
    const all = searchParams.getAll(name);
    const value = all.length === 0 ? (defaultValue !== undefined ? defaultValue : null) : all.length === 1 ? all[0] : all;

    if (meta.queryFilter.length === 0) {
      window.addEventListener("popstate", meta.popStateListener);
    }
    if (meta.queryFilter.indexOf(name) === -1) {
      meta.queryFilter.push(name);
    }

    return [
      value,
      newValue => {
        const url = new URL(window.location.toString());
        if (newValue === null) {
          url.searchParams.delete(name);
        } else {
          url.searchParams.delete(name);
          if (newValue instanceof Array) {
            for (const n of newValue) {
              url.searchParams.append(name, n);
            }
          } else {
            url.searchParams.append(name, newValue);
          }
        }
        const path = url.toString();
        window.history.pushState({path}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
        refresh();
      }
    ];
  }

  function useAttribute(name: string, defaultValue?: string): string | null {
    if (lock) {
      throw new Error("cannot use useAttribute after render!");
    }
    //lockUseState = true;
    const value = element.getAttribute(name);

    if (meta.attributeFilter.indexOf(name) === -1) {
      meta.attributeFilter.push(name);
      setupObserver(element, meta);
    }
    return value !== null ? value : defaultValue ? defaultValue : null;
  }

  function useEffect(effect: () => undefined | (() => void)) {
    if (lock) {
      throw new Error("cannot use useEffect after render!");
    }
    //lockUseState = true;
    if (firstRun) {
      effects.push(effect);
    }
  }

  function useState<T>(defaultValue?: T): [T | undefined, SetFunction<T>] {
    if (lock) {
      throw new Error("cannot use useState after render!");
    }
    if (lockUseState) {
      throw new Error("cannot use useState after useEffect or useAttribute!");
    }
    const currentValueKey = valueKeyAccess;
    if (!firstRun && currentValueKey >= count) {
      throw new Error("conditional useState detected!");
    }
    valueKeyAccess++;

    if (firstRun) {
      meta.componentValues[currentValueKey] = {
        defaultValue,
        value: undefined
      };
    }

    const currentValue = meta.componentValues[currentValueKey];

    if (currentValue.defaultValue !== defaultValue) {
      throw new Error("conditional useState detected different defaultValues!");
    }

    const value = currentValue.value !== undefined ? currentValue.value : currentValue.defaultValue;

    return [
      value,
      newValue => {
        currentValue.value = newValue;
        refresh();
      }
    ];
  }

  function useSubscription<S, R>(store: Store<S>, selector: Selector<S, R>): R | undefined {
    /*
    let storeValue: R | undefined;
    let setStoreValue: SetFunction<R>;
    if (firstRun) {
      [storeValue, setStoreValue] = useState<R>(selector(store.getState()))
    } else {
      const currentValueKey = valueKeyAccess;
      const currentValue = meta.componentValues[currentValueKey];
      if (!currentValue) {
        throw new Error("conditional useState detected!");
      }
      [storeValue, setStoreValue] = useState<R>(currentValue.defaultValue)
    }*/
    const [storeValue, setStoreValue] = useState<R>()
    useEffect(() => {
      const listener = function (newValue: R) {
        setStoreValue(newValue);
      }
      setStoreValue(store.subscribe(selector, listener));
      return () => {
        store.unSubscribe(listener);
      }
    });
    return storeValue;
  }

  return {
    this: {
      useSubscription,
      useQuery,
      useAttribute,
      useEffect,
      useState
    },
    validate: () => {
      lock = true;
      return valueKeyAccess === meta.componentValues.length;
    },
    after: firstRun ? () => {
      log(LOG_LEVEL.debug, "context after %s", firstRun);
      if (firstRun) {
        for (const effect of effects) {
          try {
            const disconnected = effect();
            if (disconnected) {
              meta.effects.push({disconnected});
            }
          } catch (e) {
            log(LOG_LEVEL.error, e);
          }
        }
      }
    } : undefined
  };
}
