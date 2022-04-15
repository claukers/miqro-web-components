import {IComponent} from "../template/index.js";
import {render} from "./render.js";

export type ComponentState = { [p: string]: any };

export class Component<S extends ComponentState = ComponentState> extends HTMLElement implements IComponent {

  public state: S;

  constructor() {
    super();
    this.state = {} as S; // start empty
  }

  public connectedCallback(): void {
    return render(this);
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
      return render(this);
    }
  }
}


