const {fake, requireMock, before, after} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "template", "vdom", "parse.js");

describe("template.vdom.parse unit tests", () => {

  let oldDOMParser;
  before(function () {
    oldDOMParser = globalThis.DOMParser;
    globalThis.DOMParser = class {
      parseFromString() {

      }
    }
  });
  after(function () {
    globalThis.DOMParser = oldDOMParser;
  });

  it("happy path renderTemplate doesn't call renderNodeChildrenOnElement when template is some thing else", async () => {
    const template = {};
    const values = "some other values";
    const fakeMap = "fakeMap";

    const renderNodeChildrenOnElement = fake(() => {

    });
    const {parseTemplateXML} = requireMock(testFilePath, {
      "./nodes/index.js": {}
    }, distPath);

    parseTemplateXML(template, values, fakeMap);
    strictEqual(renderNodeChildrenOnElement.callCount, 0);
  });


  it("happy path renderTemplate calls renderNodeChildrenOnElement when template is string", async () => {
    const template = "templateString";
    const childNodes = "some value";
    const values = "some other values";
    const fakeRenderReturn = "other fake value";
    const parseFromString = fake(() => {
      return {
        children: [
          {
            childNodes
          }
        ]
      }
    });
    const DOMParserCtor = fake(() => {

    });
    DOMParser = class {
      constructor() {
        DOMParserCtor(...arguments);
      }

      parseFromString() {
        return parseFromString(...arguments);
      }
    }

    const parseChildNodes = fake(() => {
      return fakeRenderReturn;
    });
    const {parseTemplateXML} = requireMock(testFilePath, {
      "./nodes/index.js": {
        parseChildNodes
      }
    }, distPath);

    const ret = parseTemplateXML(template, values);
    strictEqual(ret, fakeRenderReturn);
    strictEqual(parseChildNodes.callCount, 1);
    strictEqual(parseChildNodes.callArgs[0][0], childNodes);
    strictEqual(parseChildNodes.callArgs[0][1], values);
    strictEqual(DOMParserCtor.callCount, 1);
    strictEqual(DOMParserCtor.callArgs[0].length, 0);
    strictEqual(parseFromString.callCount, 1);
    strictEqual(parseFromString.callArgs[0][0], `<root>${template}</root>`);
  });

});


