import {ITemplateNode, getTemplateFromLocation, IComponent, renderTemplate} from "../template/index.js";
import {renderTemplateNodeDiff} from "./render-diff.js";

const lastTemplateMap = new WeakMap<IComponent, ITemplateNode[]>();

export function render(component: IComponent): void {
  if (!component.isConnected) {
    return;
  }

  // console.log("render %s", component.tagName);

  const template = getComponentTemplate(component as IComponent);
  if (typeof template === "string") {
    renderTemplateOnComponent(template, component);
  } else if (template instanceof Promise) {
    template.then(function queueRenderComponent(template) {
      renderTemplateOnComponent(template, component);
    }).catch(e => {
      console.error("cannot render template %s for %o", (component.constructor as any).template, component);
      console.error(e);
    });
  }
}

function disposeAll(nodes: ITemplateNode[]): void {
  for (const n of nodes) {
    const children = n.children;
    n.dispose(n.ref as Node);
    if (children) {
      disposeAll(children);
    }
  }
}

function renderTemplateOnComponent(template: string, component: IComponent) {
  const output = renderTemplate(template, {
    this: component,
    children: component.templateChildren ? component.templateChildren : []
  });
  if (output) {
    const oldTemplate = lastTemplateMap.get(component);
    lastTemplateMap.set(component, output);
    renderTemplateNodeDiff(component, output, oldTemplate);
    if (oldTemplate) {
      disposeAll(oldTemplate);
    }
  }
}

function getComponentTemplate(component: IComponent): string | void | Promise<string> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateFromLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}
