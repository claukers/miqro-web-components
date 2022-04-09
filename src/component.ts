import {renderComponent} from "./template.js";

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



