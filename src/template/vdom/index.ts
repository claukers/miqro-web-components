export {ITemplateNode, TemplateNode} from "./nodes/node.js";

import {ITemplateNode} from "./nodes/node.js";
import {appendChildren, removeChildrenFrom} from "../utils/template.js";

export function renderTemplateNodeDiff(root: Node, current?: ITemplateNode<Node>[], old?: ITemplateNode<Node>[]): boolean {
  // do some copying to not alter the original three
  old = old ? [...old] : [];
  current = current ? [...current] : [];
  let i;
  let ret = false;
  for (i = 0; i < current.length; i++) {
    const currentTemplateNode = current[i];
    const oldTemplateNode = old[i];

    if (oldTemplateNode === undefined) {
      //console.log("render node create on %s", currentTemplateNode.toString());
      ret = true;
      const createdRef = currentTemplateNode.create(root);
      //console.log("%o.ref %o", createdRef, currentTemplateNode.ref);
      appendChildren(root, createdRef);
    } else {
      // current child exists
      if (oldTemplateNode.type !== currentTemplateNode.type) {
        //console.log("render node create on %s", currentTemplateNode.toString());
        ret = true;
        // splice current childs
        removeChildrenFrom(old, i);
        // append new element
        const createdRef = currentTemplateNode.create(root);
        //console.log("%o.ref %o", createdRef, currentTemplateNode.ref);
        appendChildren(root, createdRef);
      } else {
        const compareRet = currentTemplateNode.compare(oldTemplateNode);
        if (!compareRet) {
          //console.log("render node create on %s", currentTemplateNode.toString());
          ret = true;
          // splice current childs and remove them from the dom
          removeChildrenFrom(old, i);
          // append new element
          const createdRef = currentTemplateNode.create(root);
          //console.log("%o.ref %o", createdRef, currentTemplateNode.ref);
          appendChildren(root, createdRef);
        } else {
          const currentRef = oldTemplateNode.ref as HTMLElement;
          if (!currentRef) {
            debugger;
          }
          const oldChildren = oldTemplateNode.children;
          //console.log("render node update on %s", currentTemplateNode.toString());
          const r = currentTemplateNode.update(currentRef);
          if (r) {
            ret = true;
          }
          // recursive on children
          const r2 = renderTemplateNodeDiff(currentRef, currentTemplateNode.children, oldChildren);
          if (r2) {
            ret = true;
          }
        }
      }
    }
  }
  if (old) {
    removeChildrenFrom(old, i);
  }
  return ret;
}
