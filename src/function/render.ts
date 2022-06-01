import {render as queueRender} from "../template/index.js";
import {FunctionComponent, FunctionMeta, RenderContext} from "./common.js";
import {log, LOG_LEVEL} from "../log.js";

export function renderFunction(element: HTMLElement, context: RenderContext, meta: FunctionMeta, root: HTMLElement | ShadowRoot, render: FunctionComponent) {
  queueRender(root, async function () {
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
      log(LOG_LEVEL.error, e);
      return undefined;
    }
  }, undefined, context.after ? function () {
    log(LOG_LEVEL.debug, "after %o", element);
    if (context.after) {
      context.after();
    }
  } : undefined);
}
