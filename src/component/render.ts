import {getTemplateLocation, IComponent, nodeList2Array, renderTemplate} from "./template/index.js";

const templateChildrenMap = new WeakMap<HTMLElement, (HTMLElement | Node)[]>();

export function render(component: HTMLElement): void {
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

function renderTemplateOnComponent(template: string | string[], component: HTMLElement) {
  if (component.isConnected) {
    if (!templateChildrenMap.has(component)) {
      templateChildrenMap.set(component, nodeList2Array(component.childNodes));
    }
    const output = renderTemplate(template, {this: component}, templateChildrenMap);
    if (output) {
      component.innerHTML = "";
      for (let i = 0; i < output.length; i++) {
        component.appendChild(output[i]);
      }
    }
  }
}

function getComponentTemplate(component: IComponent): string | string[] | void | Promise<string> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}
