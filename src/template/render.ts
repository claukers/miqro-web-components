import {
  parseXML,
  RenderFunction,
  RenderFunctionOutput,
  TemplateValues,
  weakMapGet,
  weakMapHas,
  weakMapSet
} from "./utils/index.js";
import {ITemplateNode, renderTemplateNodeDiff, TemplateNode} from "./vdom/index.js";
import {renderTemplate} from "./render-template.js";
import {log, LOG_LEVEL} from "../log.js";
import {cancelRender} from "./render-queue.js";

export type ApplyRenderCallback = () => boolean;

export function disconnect(component: Node) {
  cancelRender(component);
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);
  if (oldTemplate) {
    disconnectAll(oldTemplate.output);
    //weakMapDelete.call(lastTemplateMap, component);
  }
}

export function hasCache(component: Node): boolean {
  return weakMapHas.call(lastTemplateMap, component);
}

export async function render(abortSignal: AbortSignal, element: Node, template: RenderFunction | RenderFunctionOutput, values?: TemplateValues): Promise<{ apply: ApplyRenderCallback } | undefined> {
  log(LOG_LEVEL.trace, "render %o", element);
  if (values !== undefined && typeof template === "function") {
    throw new Error("cannot provide a RenderFunction with values");
  }
  const t = typeof template === "string" ? template : typeof template === "function" ? await template({
    abortSignal
  }) : template ? await template : undefined;
  const v = typeof t === "object" ? t.values : values;
  let output: string[] | string | void = t instanceof Array ? t : (typeof t === "object" ? await t.template : await t);
  const stringTemplate = output instanceof Array ? output.join() : output;
  output = undefined;

  if (abortSignal.aborted) {
    log(LOG_LEVEL.trace, "render aborted %o", element);
    return;
  }
  if (stringTemplate) {
    const {output, xmlDocument} = await renderTemplateOnElement(stringTemplate, element, v ? v : Object.create(null));
    if (abortSignal.aborted) {
      log(LOG_LEVEL.trace, "render aborted %o", element);
      return;
    }

    return {
      apply: () => {
        if (abortSignal.aborted) {
          log(LOG_LEVEL.trace, "render aborted %o", element);
          return false;
        }
        return applyRender(abortSignal, xmlDocument, stringTemplate, element, output);
      }
    };
  }
}

async function renderTemplateOnElement(template: string, element: Node, values: TemplateValues): Promise<{ output: TemplateNode<Node>[] | undefined; xmlDocument: XMLDocument; }> {
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, element);

  const xmlDocument = oldTemplate && oldTemplate.template === template ?
    oldTemplate.xmlDocument :
    parseXML(template)

  const output = await renderTemplate(template, values, xmlDocument);

  return {output, xmlDocument};
}

function applyRender(abortSignal: AbortSignal, xmlDocument: XMLDocument, template: string, element: Node, output?: TemplateNode<Node>[]): boolean {
  if (abortSignal.aborted) {
    log(LOG_LEVEL.trace, "render aborted %o", element);
    return false;
  }
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, element);
  if (output) {
    const ret = renderTemplateNodeDiff(element, output, oldTemplate?.output);
    weakMapSet.call(lastTemplateMap, element, {output, template, xmlDocument} as TemplateMapValue);
    if (oldTemplate) {
      disconnectAll(oldTemplate.output);
    }
    return ret;
  }
  return false;
}

interface TemplateMapValue {
  output: ITemplateNode[];
  xmlDocument: XMLDocument;
  template: string;
}

const lastTemplateMap = new WeakMap<Node, TemplateMapValue>();

function disconnectAll(nodes: ITemplateNode[]): void {
  for (const n of nodes) {
    const children = n.children;
    n.disconnect(n.ref as Node);
    if (children) {
      disconnectAll(children);
    }
  }
}
