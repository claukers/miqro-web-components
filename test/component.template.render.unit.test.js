const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");

it("happy path renderTemplate calls renderNodeChildrenOnElement when template is string", async () => {
  const template = "templateString";
  const childNodes = "some value";
  const values = "some other values";
  const fakeMap = "fakeMap";
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
  const renderNodeChildrenOnElement = fake(() => {
    return fakeRenderReturn;
  });
  const {renderTemplate} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "render.js"), {
    "./nodes/children.js": {
      renderNodeChildrenOnElement
    }
  }, resolve(__dirname, "..", "dist"));

  const ret = renderTemplate(template, values, fakeMap);
  strictEqual(ret, fakeRenderReturn);
  strictEqual(renderNodeChildrenOnElement.callCount, 1);
  strictEqual(renderNodeChildrenOnElement.callArgs[0][0], childNodes);
  strictEqual(renderNodeChildrenOnElement.callArgs[0][1], values);
  strictEqual(renderNodeChildrenOnElement.callArgs[0][2], fakeMap);
  strictEqual(DOMParserCtor.callCount, 1);
  strictEqual(DOMParserCtor.callArgs[0].length, 0);
  strictEqual(parseFromString.callCount, 1);
  strictEqual(parseFromString.callArgs[0][0], `<root>${template}</root>`);
}, {
  category: "component.template.render unit tests"
});

it("happy path renderTemplate calls renderNodeChildrenOnElement when template is string[]", async () => {
  const template = ["template", "String"];
  const childNodes = "some value";
  const values = "some other values";
  const fakeMap = "fakeMap";
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
  const renderNodeChildrenOnElement = fake(() => {
    return fakeRenderReturn;
  });
  const {renderTemplate} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "render.js"), {
    "./nodes/children.js": {
      renderNodeChildrenOnElement
    }
  }, resolve(__dirname, "..", "dist"));

  const ret = renderTemplate(template, values, fakeMap);
  strictEqual(ret, fakeRenderReturn);
  strictEqual(renderNodeChildrenOnElement.callCount, 1);
  strictEqual(renderNodeChildrenOnElement.callArgs[0][0], childNodes);
  strictEqual(renderNodeChildrenOnElement.callArgs[0][1], values);
  strictEqual(renderNodeChildrenOnElement.callArgs[0][2], fakeMap);
  strictEqual(DOMParserCtor.callCount, 1);
  strictEqual(DOMParserCtor.callArgs[0].length, 0);
  strictEqual(parseFromString.callCount, 1);
  strictEqual(parseFromString.callArgs[0][0], `<root>${template.join("")}</root>`);
}, {
  category: "component.template.render unit tests"
});

it("happy path renderTemplate doesn't call renderNodeChildrenOnElement when template is some thing else", async () => {
  const template = {};
  const values = "some other values";
  const fakeMap = "fakeMap";

  DOMParser = null;
  const renderNodeChildrenOnElement = fake(() => {

  });
  const {renderTemplate} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "render.js"), {
    "./nodes/children.js": {
      renderNodeChildrenOnElement
    }
  }, resolve(__dirname, "..", "dist"));

  renderTemplate(template, values, fakeMap);
  strictEqual(renderNodeChildrenOnElement.callCount, 0);
}, {
  category: "component.template.render unit tests"
});
