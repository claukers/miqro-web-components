import {RenderFunction, RenderFunctionOutput, renderTemplate, TemplateValues} from "../template/index.js";
import {ITemplateNode, renderTemplateNodeDiff, TemplateNode} from "../template/vdom/index.js";

export type ApplyRenderCallback = () => boolean;

export function dispose(component: Node) {
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);
  if (oldTemplate) {
    disposeAll(oldTemplate.output);
    weakMapDelete.call(lastTemplateMap, component);
  }
}

export function hasCache(component: Node): boolean {
  return weakMapHas.call(lastTemplateMap, component);
}

export async function render(abortSignal: AbortSignal, element: Node, template: RenderFunction | RenderFunctionOutput, values?: TemplateValues): Promise<{ apply: ApplyRenderCallback } | undefined> {
  // console.log("render %s", component.tagName);
  if (values !== undefined && typeof template === "function") {
    throw new Error("cannot provide a RenderFunction with values");
  }
  const t = typeof template === "string" ? template : typeof template === "function" ? await template() : template ? await template : undefined;
  const v = typeof t === "object" ? t.values : values;
  const stringTemplate: string | void = typeof t === "object" ? await t.template : await t;

  if (abortSignal.aborted) {
    throw new Error(`aborted render for ${(element as HTMLElement).tagName} ${(element as HTMLElement).dataset.name}`);
  }
  if (stringTemplate) {
    const {output, xmlDocument} = await renderTemplateOnElement(stringTemplate, element, v ? v : Object.create(null));
    if (abortSignal.aborted) {
      throw new Error(`aborted render for ${(element as HTMLElement).tagName} ${(element as HTMLElement).dataset.name}`);
    }

    return {
      apply: () => {
        if (abortSignal.aborted) {
          throw new Error(`aborted render for ${(element as HTMLElement).tagName} ${(element as HTMLElement).dataset.name}`);
        }
        return applyRender(xmlDocument, stringTemplate, element, output);
      }
    };
  }
}

async function renderTemplateOnElement(template: string, element: Node, values: TemplateValues): Promise<{ output: TemplateNode<Node>[] | undefined; xmlDocument: XMLDocument; }> {
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, element);

  const xmlDocument = oldTemplate && oldTemplate.template === template ?
    oldTemplate.xmlDocument :
    ((new DOMParser()).parseFromString(`<root>${template}</root>`, "text/xml") as XMLDocument);

  const output = await renderTemplate(template, values, xmlDocument);

  return {output, xmlDocument};
}

function applyRender(xmlDocument: XMLDocument, template: string, element: Node, output?: TemplateNode<Node>[]): boolean {
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, element);
  if (output) {
    weakMapSet.call(lastTemplateMap, element, {output, template, xmlDocument} as TemplateMapValue);
    const ret = renderTemplateNodeDiff(element, output, oldTemplate?.output);
    if (oldTemplate) {
      disposeAll(oldTemplate.output);
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
const weakMapGet = WeakMap.prototype.get;
const weakMapHas = WeakMap.prototype.has;
const weakMapSet = WeakMap.prototype.set;
const weakMapDelete = WeakMap.prototype.delete;

function disposeAll(nodes: ITemplateNode[]): void {
  for (const n of nodes) {
    const children = n.children;
    n.dispose(n.ref as Node);
    if (children) {
      disposeAll(children);
    }
  }
}
