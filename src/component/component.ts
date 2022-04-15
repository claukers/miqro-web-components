import {IComponent, nodeList2Array} from "../template/index.js";
import {render} from "./render.js";

export type ComponentState = { [p: string]: any };

export class Component<S extends ComponentState = ComponentState> extends HTMLElement implements IComponent {

  public state: S;
  public templateChildren: Array<Node | HTMLElement>;

  constructor() {
    super();
    this.state = {} as S; // start empty
    this.templateChildren = [];
  }

  public connectedCallback(): void {
    this.templateChildren = nodeList2Array(this.childNodes);
    return this.refresh();
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
      return this.refresh();
    }
  }

  public refresh(): void {
    return render(this);
  }
}


