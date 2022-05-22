import {renderChildNodes} from "./render-children.js";
import {IComponent, TemplateValues} from "./utils/template.js";
import {ITemplateNode, renderTemplateNodeDiff, TemplateNode} from "./vdom";

export function renderTemplate(renderOutput: string | string[] | void, values: TemplateValues, xml?: XMLDocument): Promise<Array<TemplateNode>> | undefined {
  //console.log("renderOnElement [%s] dataset [%o]", (element instanceof HTMLElement ? element : element.host as HTMLElement).tagName, ((element instanceof HTMLElement ? element : element.host as HTMLElement)).dataset);
  if (renderOutput instanceof Array) {
    renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
  }
  if (typeof renderOutput === "string") {
    const xmlDocument: XMLDocument = xml ? xml : ((new DOMParser()).parseFromString(`<root>${renderOutput}</root>`, "text/xml") as XMLDocument);

    const root = xmlDocument.children[0];
    return renderChildNodes(root.childNodes, values);
  }
}

export async function renderTemplateOnElement(template: string, element: Node, values?: TemplateValues): Promise<void> {
  const component = element as IComponent;
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);

  const xmlDocument = oldTemplate && oldTemplate.template === template ?
    oldTemplate.xmlDocument :
    ((new DOMParser()).parseFromString(`<root>${template}</root>`, "text/xml") as XMLDocument);


  const output = await renderTemplate(template, values ? values : {
    this: component,
    children: component.templateChildren ? component.templateChildren : []
  }, xmlDocument);

  if (output) {
    weakMapSet.call(lastTemplateMap, component, {output, template, xmlDocument} as TemplateMapValue);
    renderTemplateNodeDiff(element, output, oldTemplate?.output);
    if (oldTemplate) {
      disposeAll(oldTemplate.output);
    }
  }
}

export function dispose(element: HTMLElement) {
  const component = element as IComponent;
  const oldTemplate: TemplateMapValue = weakMapGet.call(lastTemplateMap, component);
  if (oldTemplate) {
    disposeAll(oldTemplate.output);
    weakMapDelete.call(lastTemplateMap, component);
  }
}

interface TemplateMapValue {
  output: ITemplateNode[];
  xmlDocument: XMLDocument;
  template: string;
}

const lastTemplateMap = new WeakMap<IComponent, TemplateMapValue>();
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
