import {RenderFunctionArgs, FunctionMeta, RenderContext, SetFunction} from "./common.js";

export function getRenderContext(meta: FunctionMeta, firstRun: boolean, refresh: () => void): RenderContext {
  let valueKeyAccess = 0;
  let lockUseState = false;
  let lock = false;
  const count = meta.componentValues.length;
  return {
    args: {
      attributes: {
        ...meta.attributeMap
      },
      children: meta.templateChildren,
      useEffect: function (effect: () => undefined | (() => void)) {
        if (lock) {
          throw new Error("cannot use useEffect after render!");
        }
        lockUseState = true;
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
          throw new Error("cannot use useState after useEffect!");
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
          function setValue(newValue): void {
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
