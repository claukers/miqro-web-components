import {FunctionMeta, RenderContext, SetFunction} from "./common.js";

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

  return {
    this: {
      useQuery: function (name: string, defaultValue?: string | string[]): [string[] | string | null, SetFunction<string[] | string | null>] {
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
      },
      useAttribute: function (name: string, defaultValue?: string): string | null {
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
      },
      useEffect: function (effect: () => undefined | (() => void)) {
        if (lock) {
          throw new Error("cannot use useEffect after render!");
        }
        //lockUseState = true;
        if (firstRun) {
          const disconnected = effect();
          if (disconnected) {
            meta.effects.push({
              disconnected
            });
          }
        }
      },
      useState: function <T>(defaultValue?: T): [T | undefined, SetFunction<T>] {
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
    },
    validate: () => {
      lock = true;
      return valueKeyAccess === meta.componentValues.length;
    }
  };
}
