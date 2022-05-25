import {getTemplateFromLocation, IComponent, renderTemplate, TemplateValues} from "./template/index.js";
import {ITemplateNode, renderTemplateNodeDiff, TemplateNode} from "./template/vdom/index.js";

export type ApplyRenderCallback = () => boolean;

export function dispose(component: IComponent) {
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);
  if (oldTemplate) {
    disposeAll(oldTemplate.output);
    weakMapDelete.call(lastTemplateMap, component);
  }
}

export function hasCache(component: IComponent): boolean {
  return weakMapHas.call(lastTemplateMap, component);
}

export async function render(abortSignal: AbortSignal, component: IComponent, values: TemplateValues, optionalTemplate?: string | Promise<string>): Promise<{ apply: ApplyRenderCallback } | undefined> {
  // console.log("render %s", component.tagName);
  const template = optionalTemplate ? optionalTemplate : getComponentTemplate(component as IComponent);
  const t = typeof template === "string" ? template : await template;
  if (abortSignal.aborted) {
    throw new Error(`aborted render for ${(component as HTMLElement).tagName} ${(component as HTMLElement).dataset.name}`);
  }
  if (typeof t === "string") {
    const {output, xmlDocument} = await renderTemplateOnElement(t, component, values);
    if (abortSignal.aborted) {
      throw new Error(`aborted render for ${(component as HTMLElement).tagName} ${(component as HTMLElement).dataset.name}`);
    }

    return {
      apply: () => {
        return applyRender(xmlDocument, t, component, output);
      }
    };
  }
}

function getComponentTemplate(component: IComponent): string[] | string | void | Promise<string | string[]  | undefined> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateFromLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}

async function renderTemplateOnElement(template: string, element: Node, values: TemplateValues): Promise<{ output: TemplateNode<Node>[] | undefined; xmlDocument: XMLDocument; }> {
  const component = element as IComponent;
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);

  const xmlDocument = oldTemplate && oldTemplate.template === template ?
    oldTemplate.xmlDocument :
    ((new DOMParser()).parseFromString(`<root>${template}</root>`, "text/xml") as XMLDocument);

  const output = await renderTemplate(template, values, xmlDocument);

  return {output, xmlDocument};
}

function applyRender(xmlDocument: XMLDocument, template: string, element: Node, output?: TemplateNode<Node>[]): boolean {
  const component = element as IComponent;
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);
  if (output) {
    weakMapSet.call(lastTemplateMap, component, {output, template, xmlDocument} as TemplateMapValue);
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

const lastTemplateMap = new WeakMap<IComponent, TemplateMapValue>();
const lastTemplateMap2 = new WeakMap<IComponent, {template: string}>();
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
