import {VDOMNode} from "./nodes/node.js";
import {parseXML, TemplateValues} from "../utils/index.js";
import {log, LOG_LEVEL} from "../../utils.js";
import {parseChildNodes} from "./nodes/index.js";

export function parseTemplateXML(renderOutput: string | string[] | undefined, values: TemplateValues, xml?: XMLDocument): Promise<Array<VDOMNode>> | undefined {
  if (renderOutput instanceof Array) {
    renderOutput = renderOutput.filter(r => r).map(r => String(r)).join("");
  }
  if (typeof renderOutput === "string") {
    log(LOG_LEVEL.trace, xml ? "using cache" : "not using cache");
    const xmlDocument: XMLDocument = xml ? xml : parseXML(renderOutput);

    const root = xmlDocument.children[0];
    return parseChildNodes(root.childNodes, values);
  }
}


