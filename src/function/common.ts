import {nodeList2Array, RenderFunctionOutput, TemplateValues, render as queueRender} from "../template/index.js";

export type UseStateFunction<T = any> = (defaultValue?: T) => [T | undefined, SetFunction<T>];

export interface FunctionComponentArgs {
  useState: UseStateFunction;
  firstRun: boolean;
}

export type FunctionComponentOutput = { template: RenderFunctionOutput; values: TemplateValues; };

export type FunctionComponent = (args: FunctionComponentArgs) => Promise<FunctionComponentOutput> | FunctionComponentOutput;

export type SetFunction<T = any> = (newValue: T) => void;

export interface ComponentMeta {
  shadowRoot?: ShadowRoot;
  templateChildren?: Node[];
  componentValues: {
    value?: any;
    defaultValue?: any;
  }[];
}

function getRenderArgs(meta: ComponentMeta, firstRun: boolean, refresh: () => void): { args: FunctionComponentArgs, validate: () => boolean; } {
  let valueKeyAccess = 0;
  const count = meta.componentValues.length;
  //console.log("firstRun " + firstRun);
  return {
    args: {
      firstRun,
      useState: function <T>(defaultValue?: T): [T | undefined, SetFunction<T>] {
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

        const value = currentValue.value ? currentValue.value : currentValue.defaultValue;

        return [
          value,
          function setValue(newValue) {
            currentValue.value = newValue;
            refresh();
          }
        ]
      }
    } as FunctionComponentArgs,
    validate: () => {
      return valueKeyAccess === meta.componentValues.length;
    }
  };
}

export function callRender(meta: ComponentMeta, root: HTMLElement | ShadowRoot, render: FunctionComponent, firstRun: boolean) {
  queueRender(root, async () => {
    try {
      //const firstRun = !hasCache(root);

      const renderArgs = getRenderArgs(meta, firstRun, () => callRender(meta, root, render, false));
      const renderBind = render.bind(renderArgs.args);
      const output = await renderBind(renderArgs.args);
      if (!renderArgs.validate()) {
        throw new Error("conditional useState detected!");
      }
      return {
        template: output.template,
        values: output.values ? {
          children: meta.templateChildren,
          ...output.values
        } : {
          children: meta.templateChildren
        }
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  });
}
