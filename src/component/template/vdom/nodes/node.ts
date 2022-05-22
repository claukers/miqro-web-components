export type TemplateNodeType = "Element" | "Text" | "Comment" | "HTMLElementRef";

export interface ITemplateNode<S extends Node = Node> {
  ref?: S;
  children?: ITemplateNode[];
  type: TemplateNodeType;
  parent?: HTMLElement;

  create(parent: HTMLElement): S;

  update(ref: S): void;

  dispose(ref: S): void;

  compare(other: ITemplateNode<S>): boolean;
}

export class TemplateNode<S extends Node = Node> implements ITemplateNode<S> {

  public ref?: S;
  public children?: TemplateNode[];
  public parent?: HTMLElement;

  constructor(public type: TemplateNodeType) {
  }

  public create(parent: HTMLElement): S {
    throw new Error("not implemented!");
  }

  public update(ref: S): void {
    if (this.ref && this.ref !== ref) {
      throw new Error("already created!");
    }
    if (!this.ref) {
      this.ref = ref;
    }
  }

  public dispose(element: S): void {
    this.ref = undefined;
    this.children = undefined;
    this.parent = undefined;
  }

  public compare(other: TemplateNode<S>): boolean {
    return other.type === this.type;
  }

  public toString(): string {
    return `${this.type} TemplateNode`;
  }
}
