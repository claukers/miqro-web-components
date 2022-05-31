import {render as queueRender} from "../template/index.js";
import {FunctionComponent, FunctionMeta, RenderContext} from "./common.js";

export function renderFunction(element: HTMLElement, context: RenderContext, meta: FunctionMeta, root: HTMLElement | ShadowRoot, render: FunctionComponent) {
  queueRender(root, async () => {
    try {
      const children = meta.templateChildren;
      const renderBind = render.bind({...context.this});
      const output = await renderBind();
      if (!context.validate()) {
        throw new Error("conditional useState detected!");
      }
      if (output) {
        if (typeof output === "string") {
          return {
            template: output,
            values: {
              children: meta.templateChildren
            }
          };
        } else {
          return {
            template: output.template,
            values: output.values ? {
              children,
              ...output.values
            } : {
              children
            }
          };
        }
      }
    } catch (e) {
      console.error(e);
      return undefined;
    }
  });
}
