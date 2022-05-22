import {
  RefreshCallback,
  TemplateValues,
  getTemplateFromLocation,
  IComponent,
  renderTemplateOnElement
} from "./template/index.js";

export function render(component: IComponent, optionalTemplate?: string | Promise<string>, values?: TemplateValues, refresh?: RefreshCallback): void {
  // console.log("render %s", component.tagName);
  const template = optionalTemplate ? optionalTemplate : getComponentTemplate(component as IComponent);
  if (typeof template === "string") {
    renderTemplateOnElement(template, component, values, refresh);
  } else if (template instanceof Promise) {
    template.then(function queueRenderComponent(template) {
      renderTemplateOnElement(template, component, values, refresh);
    }).catch(e => {
      console.error("cannot render template %s for %o", (component.constructor as any).template, component);
      console.error(e);
    });
  }
}

function getComponentTemplate(component: IComponent): string | void | Promise<string> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateFromLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}
