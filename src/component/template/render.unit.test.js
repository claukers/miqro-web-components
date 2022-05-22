const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "template", "render.js");

describe("template.render unit tests", () => {

  it("happy path renderTemplate doesn't call renderNodeChildrenOnElement when template is some thing else", async () => {
    const template = {};
    const values = "some other values";
    const fakeMap = "fakeMap";

    DOMParser = null;
    const renderNodeChildrenOnElement = fake(() => {

    });
    const {renderTemplate} = requireMock(testFilePath, {
      "./render-children.js": {}
    }, distPath);

    renderTemplate(template, values, fakeMap);
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

    const renderChildNodes = fake(() => {
      return fakeRenderReturn;
    });
    const {renderTemplate} = requireMock(testFilePath, {
      "./render-children.js": {
        renderChildNodes
      }
    }, distPath);

    const ret = renderTemplate(template, values);
    strictEqual(ret, fakeRenderReturn);
    strictEqual(renderChildNodes.callCount, 1);
    strictEqual(renderChildNodes.callArgs[0][0], childNodes);
    strictEqual(renderChildNodes.callArgs[0][1], values);
    strictEqual(DOMParserCtor.callCount, 1);
    strictEqual(DOMParserCtor.callArgs[0].length, 0);
    strictEqual(parseFromString.callCount, 1);
    strictEqual(parseFromString.callArgs[0][0], `<root>${template}</root>`);
  });

  it("happy path renderTemplate calls renderNodeChildrenOnElement when template is string[]", async () => {
    const template = ["template", "String"];
    const childNodes = "some value";
    const values = "some other values";
    const fakeRenderReturn = "ret";
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
    const renderChildNodes = fake(() => {
      return fakeRenderReturn;
    });
    const {renderTemplate} = requireMock(testFilePath, {
      "./render-children.js": {
        renderChildNodes
      }
    }, distPath);

    const ret = renderTemplate(template, values);
    strictEqual(renderChildNodes.callCount, 1);
    strictEqual(ret, fakeRenderReturn);
    strictEqual(renderChildNodes.callCount, 1);
    strictEqual(renderChildNodes.callArgs[0][0], childNodes);
    strictEqual(renderChildNodes.callArgs[0][1], values);
    strictEqual(DOMParserCtor.callCount, 1);
    strictEqual(DOMParserCtor.callArgs[0].length, 0);
    strictEqual(parseFromString.callCount, 1);
    strictEqual(parseFromString.callArgs[0][0], `<root>${template.join("")}</root>`);
  });

});


