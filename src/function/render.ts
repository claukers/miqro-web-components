import {render as queueRender} from "../template/index.js";
import {FunctionComponent, FunctionMeta, RenderContext} from "./common.js";

export function renderFunction(context: RenderContext, meta: FunctionMeta, root: HTMLElement | ShadowRoot, render: FunctionComponent) {
  queueRender(root, async () => {
    try {
      const renderBind = render.bind({...context.args});
      const output = await renderBind();
      if (!context.validate()) {
        throw new Error("conditional useState detected!");
      }
      if (output) {
        if (typeof output === "string") {
          return {
            template: output,
            values: {
              attributes: meta.attributeMap,
              children: meta.templateChildren
            }
          };
        } else {
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
        }
      }
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, undefined);
}
