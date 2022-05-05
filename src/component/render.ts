import {getTemplateFromLocation, IComponent, renderTemplate} from "../template/index.js";

const lastTemplateMap = new WeakMap<IComponent, string>();

export function render(component: IComponent): void {
  if (!component.isConnected) {
    return;
  }

  console.log("render %s", component.tagName);

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

function renderTemplateOnComponent(template: string, component: IComponent) {
  const oldTemplate = lastTemplateMap.get(component);
  const doCompleteRefresh = oldTemplate !== template;
  if (doCompleteRefresh) {
    lastTemplateMap.set(component, template);
  }
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

function getComponentTemplate(component: IComponent): string | void | Promise<string> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateFromLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}
