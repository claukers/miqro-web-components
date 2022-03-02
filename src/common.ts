export interface IComponent<P extends ComponentProps = ComponentProps, S extends ComponentState = ComponentState> extends InnerHTML, ParentNode {
  props: P;

  state: S;

  render(): string | void;

  setProps?(props: Partial<P>, override?: boolean): void;

  afterRender?(): void;

}

export type ComponentState = { [p: string]: any };

export type ComponentProps = { [p: string]: any };


