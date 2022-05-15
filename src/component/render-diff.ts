import {ITemplateNode} from "../template/utils/template";

function removeChild(c: ITemplateNode) {
  if (c.ref) {
    //splicedOld[i].dispose(c.ref);
    if (c.parent) {
      removeChildren(c.parent, c.ref);
    } else {
      (c.ref as HTMLElement).remove();
    }
  }
}

function removeChildrenFrom(old: ITemplateNode[], from: number): void {
  const splicedOld = old.splice(from);
  splicedOld.forEach(removeChild);
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

export function renderTemplateNodeDiff(root: HTMLElement, current?: ITemplateNode<Node>[], old?: ITemplateNode<Node>[]): void {
  // do some copying to not alter the original three
  old = old ? [...old] : [];
  current = current ? [...current] : [];
  let i;
  for (i = 0; i < current.length; i++) {
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
  if (old) {
    removeChildrenFrom(old, i);
  }
}
