import {renderTemplate} from "./template.js";
import {getTemplateLocation} from "./cache.js";

export type ComponentState = { [p: string]: any };

export class Component<S extends ComponentState = ComponentState> extends HTMLElement {

  public state: S;

  constructor() {
    super();
    this.state = {} as S; // start empty
  }

  public connectedCallback(): void {
    return renderComponent(this);
  }

  /*
  will be called before a render if returns true this.render will be called.
   */
  protected didUpdate(oldState: S): boolean {
    return true;
  }

  public render(): string | string[] | void {

  }

  public setState(args: Partial<S>, refresh = true): void {
    const oldState = this.state;
    this.state = {
      ...this.state,
      ...args
    };
    if (this.didUpdate(oldState) && refresh && this.isConnected) {
      return renderComponent(this);
    }
  }
}

function renderComponent(component: Component): void {
  const template = component.constructor.hasOwnProperty("template") ?
    getTemplateLocation((component.constructor as any).template) :
    component.render();
  if (template instanceof Promise) {
    template.then(function queueRenderComponent(template) {
      if (component.isConnected) {
        renderTemplate(template, {this: component}, component);
      }
    }).catch(e => {
      console.error("cannot render Component %o", component);
      console.error(e);
    });
  } else {
    return component.isConnected && component.render ? renderTemplate(template, {this: component}, component) : undefined;
  }
}

