const DOMParserParseFromString = DOMParser.prototype.parseFromString;

export function parseXML(xml: string): XMLDocument {
  return DOMParserParseFromString.call(new DOMParser(), `<root>${xml}</root>`, "text/xml") as XMLDocument;
}
