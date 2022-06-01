import {renderChildNodes} from "./render-children.js";
import {TemplateNode} from "./vdom";
import {TemplateValues} from "./utils";
import {log, LOG_LEVEL} from "../log.js";

export function renderTemplate(renderOutput: string | string[] | undefined, values: TemplateValues, xml?: XMLDocument): Promise<Array<TemplateNode>> | undefined {
  if (renderOutput instanceof Array) {
    renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
  }
  if (typeof renderOutput === "string") {
    log(LOG_LEVEL.trace, xml ? "using cache" : "not using cache");
    const xmlDocument: XMLDocument = xml ? xml : ((new DOMParser()).parseFromString(`<root>${renderOutput}</root>`, "text/xml") as XMLDocument);

    const root = xmlDocument.children[0];
    return renderChildNodes(root.childNodes, values);
  }
}


