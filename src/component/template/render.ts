import {renderChildNodes} from "./render-children.js";
import {IComponent, RefreshCallback, TemplateValues} from "./utils/template.js";
import {ITemplateNode, TemplateNode, renderTemplateNodeDiff} from "./vdom";

export function renderTemplate(renderOutput: string | string[] | void, values: TemplateValues, refresh?: RefreshCallback): Array<TemplateNode> | undefined {
  //console.log("renderOnElement [%s] dataset [%o]", (element instanceof HTMLElement ? element : element.host as HTMLElement).tagName, ((element instanceof HTMLElement ? element : element.host as HTMLElement)).dataset);
  if (renderOutput instanceof Array) {
    renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
  }
  if (typeof renderOutput === "string") {
    const xmlDocument: XMLDocument = (new DOMParser()).parseFromString(`<root>${renderOutput}</root>`, "text/xml") as XMLDocument;

    const root = xmlDocument.children[0];
    return renderChildNodes(root.childNodes, values, refresh);
  }
}

export function renderTemplateOnElement(template: string, element: HTMLElement, values?: TemplateValues, refresh?: RefreshCallback): void {
  const component = element as IComponent;
  const output = renderTemplate(template, values ? values : {
    this: component,
    children: component.templateChildren ? component.templateChildren : []
  }, refresh);
  if (output) {
    const oldTemplate = weakMapGet.call(lastTemplateMap, component);
    weakMapSet.call(lastTemplateMap, component, output);
    renderTemplateNodeDiff(component, output, oldTemplate);
    if (oldTemplate) {
      disposeAll(oldTemplate);
    }
  }
}

export function dispose(element: HTMLElement) {
  const component = element as IComponent;
  const oldTemplate = weakMapGet.call(lastTemplateMap, component);
  if (oldTemplate) {
    disposeAll(oldTemplate);
    weakMapDelete.call(lastTemplateMap, component);
  }
}

const lastTemplateMap = new WeakMap<IComponent, ITemplateNode[]>();
const weakMapGet = WeakMap.prototype.get;
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
