import {IVDOMNode} from "./nodes/index.js";
import {appendChildren, removeChildrenFrom} from "../utils/index.js";

export function renderVDOMDiffOn(root: Node, current?: IVDOMNode<Node>[], old?: IVDOMNode<Node>[]): boolean {
  // do some copying to not alter the original three
  old = old ? [...old] : [];
  current = current ? [...current] : [];
  let i;
  let ret = false;
  for (i = 0; i < current.length; i++) {
    const currentTemplateNode = current[i];
    const oldTemplateNode = old[i];

    if (oldTemplateNode === undefined) {
      ret = true;
      const createdRef = currentTemplateNode.create(root);
      appendChildren(root, createdRef);
    } else {
      // current child exists
      if (oldTemplateNode.type !== currentTemplateNode.type) {
        ret = true;
        // splice current childs
        removeChildrenFrom(old, i);
        // append new element
        const createdRef = currentTemplateNode.create(root);
        appendChildren(root, createdRef);
      } else {
        const compareRet = currentTemplateNode.compare(oldTemplateNode);
        if (!compareRet) {
          ret = true;
          // splice current childs and remove them from the dom
          removeChildrenFrom(old, i);
          // append new element
          const createdRef = currentTemplateNode.create(root);
          appendChildren(root, createdRef);
        } else {
          const currentRef = oldTemplateNode.ref as HTMLElement;
          if (!currentRef) {
            debugger;
          }
          const oldChildren = oldTemplateNode.children;
          ret = currentTemplateNode.update(currentRef) ? true : ret;
          // recursive on children
          ret = renderVDOMDiffOn(currentRef, currentTemplateNode.children, oldChildren) ? true : ret;
        }
      }
    }
  }
  if (old) {
    removeChildrenFrom(old, i);
  }
  return ret;
}
