import {getTemplateFromLocation, IComponent, renderTemplate} from "../template/index.js";

export function render(component: IComponent): void {
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

function renderTemplateOnComponent(template: string | string[], component: IComponent) {
  const output = renderTemplate(template, {
    this: component,
    children: component.templateChildren ? component.templateChildren : []
  });
  if (output) {
    component.innerHTML = "";
    for (let i = 0; i < output.length; i++) {
      component.appendChild(output[i]);
    }
  }
}

function getComponentTemplate(component: IComponent): string | string[] | void | Promise<string> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateFromLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}
