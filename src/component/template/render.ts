import {renderCommentNode, renderTextNode, renderElementNode} from "./nodes/index.js";

export function renderTemplate(renderOutput: string | string[] | void, values: any, templateChildrenMap: WeakMap<HTMLElement, (HTMLElement | Node)[]>): Array<Node | HTMLElement> | undefined {
  //console.log("renderOnElement [%s] dataset [%o]", (element instanceof HTMLElement ? element : element.host as HTMLElement).tagName, ((element instanceof HTMLElement ? element : element.host as HTMLElement)).dataset);
  if (renderOutput instanceof Array) {
    renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
  }
  if (typeof renderOutput === "string") {
    const xmlDocument: XMLDocument = (new DOMParser()).parseFromString(`<root>${renderOutput}</root>`, "text/xml") as XMLDocument;

    const root = xmlDocument.children[0];
    return renderNodeChildrenOnElement(root.childNodes, values, templateChildrenMap);
  }
}

export function renderNodeChildrenOnElement(nodes: NodeListOf<ChildNode>, values: any, templateChildrenMap: WeakMap<HTMLElement, (HTMLElement | Node)[]>): Array<Node | HTMLElement> {
  let ret: Array<Node | HTMLElement> = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) {
      continue;
    }
    if (node.nodeType === Node.COMMENT_NODE && node.textContent !== null) {
      ret = ret.concat(renderCommentNode(node, values, templateChildrenMap));
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent !== null) {
      ret = ret.concat(renderTextNode(node, values, templateChildrenMap));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ret = ret.concat(renderElementNode(node, values, templateChildrenMap));
    }
  }
  return ret;
}
