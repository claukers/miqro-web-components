import {getTemplateFromLocation, IComponent, renderTemplate} from "../template/index.js";
import {TemplateNode} from "../template/utils/template.js";

const lastTemplateMap = new WeakMap<IComponent, TemplateNode[]>();

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

function removeChildrenFrom(old: TemplateNode[], from: number): void {
  const splicedOld = old.splice(from);
  splicedOld.forEach((c, i) => {
    if (c.ref) {
      //splicedOld[i].dispose(c.ref);
      if (c.parent) {
        removeChildren(c.parent, c.ref);
      } else {
        (c.ref as HTMLElement).remove();
      }
    }
  });
}

function appendChildren(root: HTMLElement, children: Node | Node[]) {
  if (children instanceof Array) {
    for (const cR of children) {
      root.appendChild(cR);
    }
  } else {
    root.appendChild(children);
  }
}

function removeChildren(root: HTMLElement, children: Node | Node[]) {
  if (children instanceof Array) {
    for (const cR of children) {
      root.removeChild(cR);
    }
  } else {
    root.removeChild(children);
  }
}

function renderTemplateNodeDiff(root: HTMLElement, current?: TemplateNode<Node>[], old?: TemplateNode<Node>[]): void {
  // do some copying
  old = old ? [...old] : [];
  current = current ? [...current] : [];
  for (let i = 0; i < current.length; i++) {
    const currentTemplateNode = current[i];
    const oldTemplateNode = old[i];

    if (oldTemplateNode === undefined) {
      console.log("render node create on $s", currentTemplateNode.toString());
      const createdRef = currentTemplateNode.create(root);
      appendChildren(root, createdRef);
    } else {
      // current child exists
      if (oldTemplateNode.type !== currentTemplateNode.type) {
        console.log("render node create on %s", currentTemplateNode.toString());
        // splice current childs
        removeChildrenFrom(old, i);
        // append new element
        const createdRef = currentTemplateNode.create(root);
        appendChildren(root, createdRef);
        continue;
      } else {
        if (!currentTemplateNode.compare(oldTemplateNode)) {
          console.log("render node create on %s", currentTemplateNode.toString());
          // splice current childs and remove them from the dom
          removeChildrenFrom(old, i);
          // append new element
          const createdRef = currentTemplateNode.create(root);
          appendChildren(root, createdRef);
        } else {
          const currentRef = oldTemplateNode.ref as HTMLElement;
          const oldChildren = oldTemplateNode.children;
          console.log("render node update on %s", currentTemplateNode.toString());
          currentTemplateNode.update(currentRef);
          // recursive on children
          renderTemplateNodeDiff(currentRef, currentTemplateNode.children, oldChildren);
        }
      }
    }
  }
}

function disposeAll(nodes: TemplateNode[]): void {
  for (const n of nodes) {
    const children = n.children;
    n.dispose(n.ref as Node);
    if (children) {
      disposeAll(children);
    }
  }
}

function renderTemplateOnComponent(template: string, component: IComponent) {
  const output = renderTemplate(template, {
    this: component,
    children: component.templateChildren ? component.templateChildren : []
  });
  if (output) {
    const oldTemplate = lastTemplateMap.get(component);
    lastTemplateMap.set(component, output);
    renderTemplateNodeDiff(component, output, oldTemplate ? oldTemplate : []);
    if (oldTemplate) {
      disposeAll(oldTemplate);
    }
  }
}

function getComponentTemplate(component: IComponent): string | void | Promise<string> {
  return component.constructor && component.constructor.hasOwnProperty("template") ?
    getTemplateFromLocation((component.constructor as any).template) :
    (component.render ? component.render() : undefined)
}
