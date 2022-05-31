import {render as queueRender, RenderFunctionOutput, TemplateValues} from "../template/index.js";

export type UseStateFunction<T = any> = (defaultValue?: T) => [T | undefined, SetFunction<T>];

//export type UseAttributeFunction = (defaultValue?: string) => string | undefined;
export type UseEffectFunction = (effect: () => undefined | (() => void)) => void;

export interface FunctionComponentArgs {
  useState: UseStateFunction;
  useEffect: UseEffectFunction;
}

export type FunctionComponentOutput = { template: RenderFunctionOutput; values: TemplateValues; };

export type FunctionComponent = () => Promise<FunctionComponentOutput> | FunctionComponentOutput;

export type SetFunction<T = any> = (newValue: T) => void;

export interface ComponentMeta {
  shadowRoot?: ShadowRoot;
  attributeMap: {
    [name: string]: string | undefined;
  },
  observer: MutationObserver;
  refresh: (firstRun?: boolean) => void;
  effects: {
    connected?: () => void;
    disconnected?: () => void;
  }[];
  templateChildren?: Node[];
  componentValues: {
    value?: any;
    defaultValue?: any;
  }[];
}

export interface RenderContext {
  args: FunctionComponentArgs,
  validate: () => boolean;
  //after: () => void;
}

export function callRender(context: RenderContext, meta: ComponentMeta, root: HTMLElement | ShadowRoot, render: FunctionComponent) {
  //let context: { args: FunctionComponentArgs, validate: () => boolean; after: () => void; } | undefined;
  queueRender(root, async () => {
    try {
      //const firstRun = !hasCache(root);
      /*if (firstRun) {
        console.log("%o firstRun", root);
      }*/

      //context = context ? context : getRenderContext(meta, firstRun, () => callRender(meta, root, render, false));
      const renderBind = render.bind({...context.args});
      const output = await renderBind();
      if (!context.validate()) {
        throw new Error("conditional useState detected!");
      }
      //console.log("template children %o", meta.templateChildren);
      return {
        template: output.template,
        values: output.values ? {
          children: meta.templateChildren,
          attributes: meta.attributeMap,
          ...output.values
        } : {
          attributes: meta.attributeMap,
          children: meta.templateChildren
        }
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, undefined);
}
