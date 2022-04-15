import {getTemplateLocation, IComponent, nodeList2Array, renderTemplate} from "../template/index.js";

export function render(component: HTMLElement): void {
  if (!component.isConnected) {
    return;
  }

  const template = getComponentTemplate(component as IComponent);
  if (typeof template === "string" || template instanceof Array) {
    renderTemplateOnComponent(template, component);
  } else if (template instanceof Promise) {
    template.then(function queueRenderComponent(template) {
      renderTemplateOnComponent(template, component);
    }).catch(e => {
      console.error("cannot render Index %o", component);
      console.error(e);
    });
  }
}

const childrenMap = new WeakMap<HTMLElement, Array<Node | HTMLElement>>();

function getComponentChildren(component: HTMLElement): Array<Node | HTMLElement> {
  let templateChildren = childrenMap.get(component);
  if (templateChildren === undefined) {
    templateChildren = nodeList2Array(component.childNodes);
    childrenMap.set(component, templateChildren);
  }
  return templateChildren;
}

function renderTemplateOnComponent(template: string | string[], component: HTMLElement) {
  const children = getComponentChildren(component);
  const output = renderTemplate(template, {this: component, children});
  if (output) {
    component.innerHTML = "";
    for (let i = 0; i < output.length; i++) {
      component.appendChild(output[i]);
    }
  }
}

function getComponentTemplate(component: IComponent): string | string[] | void | Promise<string> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}
