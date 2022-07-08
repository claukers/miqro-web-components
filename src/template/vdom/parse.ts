import {log, LOG_LEVEL, parseXML, TemplateValues} from "../../common/index.js";
import {parseChildNodes, VDOMNode} from "./nodes/index.js";

export function parseTemplateXML(renderOutput: string | undefined, values: TemplateValues, xml?: XMLDocument): Promise<Array<VDOMNode>> | undefined {
  if (typeof renderOutput === "string") {
    log(LOG_LEVEL.trace, xml ? "using cache" : "not using cache");
    const xmlDocument: XMLDocument = xml ? xml : parseXML(renderOutput);

    const root = xmlDocument.children[0];
    return parseChildNodes(root.childNodes, values);
  }
}


