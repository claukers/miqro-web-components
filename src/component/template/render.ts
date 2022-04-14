import {renderNodeChildrenOnElement} from "./render-children.js";
import {TemplateValues} from "./utils/template";

export function renderTemplate(renderOutput: string | string[] | void, values: TemplateValues): Array<Node | HTMLElement> | undefined {
  //console.log("renderOnElement [%s] dataset [%o]", (element instanceof HTMLElement ? element : element.host as HTMLElement).tagName, ((element instanceof HTMLElement ? element : element.host as HTMLElement)).dataset);
  if (renderOutput instanceof Array) {
    renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
  }
  if (typeof renderOutput === "string") {
    const xmlDocument: XMLDocument = (new DOMParser()).parseFromString(`<root>${renderOutput}</root>`, "text/xml") as XMLDocument;

    const root = xmlDocument.children[0];
    return renderNodeChildrenOnElement(root.childNodes, values);
  }
}


