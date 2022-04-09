const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");

/*it("happy path renderTemplate calls renderNodeChildrenOnElement when template is string", async () => {
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
  const lib = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "render.js"), {
    "./nodes/index.js": {

    }
  }, resolve(__dirname, "..", "dist"));

  lib.renderNodeChildrenOnElement = fake(() => {
    return fakeRenderReturn;
  });
  const renderTemplate = lib.renderTemplate;

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
  const lib = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "render.js"), {
    "./nodes/index.js": {

    }
  }, resolve(__dirname, "..", "dist"));

  lib.renderNodeChildrenOnElement = fake(() => {
    return fakeRenderReturn;
  });
  const renderTemplate = lib.renderTemplate;

  const ret = renderTemplate(template, values, fakeMap);
  strictEqual(lib.renderNodeChildrenOnElement.callCount, 1);
  strictEqual(ret, fakeRenderReturn);
  strictEqual(lib.renderNodeChildrenOnElement.callCount, 1);
  strictEqual(lib.renderNodeChildrenOnElement.callArgs[0][0], childNodes);
  strictEqual(lib.renderNodeChildrenOnElement.callArgs[0][1], values);
  strictEqual(lib.renderNodeChildrenOnElement.callArgs[0][2], fakeMap);
  strictEqual(DOMParserCtor.callCount, 1);
  strictEqual(DOMParserCtor.callArgs[0].length, 0);
  strictEqual(parseFromString.callCount, 1);
  strictEqual(parseFromString.callArgs[0][0], `<root>${template.join("")}</root>`);
}, {
  category: "component.template.render unit tests"
});*/

it("happy path renderTemplate doesn't call renderNodeChildrenOnElement when template is some thing else", async () => {
  const template = {};
  const values = "some other values";
  const fakeMap = "fakeMap";

  DOMParser = null;
  const renderNodeChildrenOnElement = fake(() => {

  });
  const {renderTemplate} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "render.js"), {
    "./nodes/index.js": {

    }
  }, resolve(__dirname, "..", "dist"));

  renderTemplate(template, values, fakeMap);
  strictEqual(renderNodeChildrenOnElement.callCount, 0);
}, {
  category: "component.template.render unit tests"
});

it("render text, comment, element nodes, ignore others and concat results", async () => {
  Node = {
    COMMENT_NODE: "COMMENT_NODE",
    TEXT_NODE: "TEXT_NODE",
    ELEMENT_NODE: "ELEMENT_NODE",
    OTHER: "OTHER"
  }
  const fakeValues = "fakeValues";
  const fakeMap = "fakeMap";
  const elementRet = ["1", "2"];
  const commentRet = ["3", "4"];
  const textRet = ["5", "6"];
  const mocks = {
    ["./nodes/index.js"]: {
      renderElementNode: fake(() => {
        return elementRet;
      }),
      renderCommentNode: fake(() => {
        return commentRet;
      }),
      renderTextNode: fake(() => {
        return textRet;
      })
    }
  };
  const childNodes = [
    {
      nodeType: Node.TEXT_NODE,
      textContent: "text node"
    },
    {
      nodeType: Node.COMMENT_NODE,
      textContent: "comment node"
    },
    {
      nodeType: Node.ELEMENT_NODE
    },
    {
      nodeType: Node.OTHER,
      textContent: "text node"
    }
  ];
  const {
    renderNodeChildrenOnElement
  } = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "render.js"), mocks, resolve(__dirname, "..", "dist"));
  const ret = renderNodeChildrenOnElement(childNodes, fakeValues, fakeMap);
  strictEqual(ret.length, 6);
  strictEqual(ret[0], "5");
  strictEqual(ret[1], "6");
  strictEqual(ret[2], "3");
  strictEqual(ret[3], "4");
  strictEqual(ret[4], "1");
  strictEqual(ret[5], "2");
  strictEqual(mocks["./nodes/index.js"].renderCommentNode.callCount, 1);
  strictEqual(mocks["./nodes/index.js"].renderCommentNode.callArgs[0][0], childNodes[1]);
  strictEqual(mocks["./nodes/index.js"].renderCommentNode.callArgs[0][1], fakeValues);
  strictEqual(mocks["./nodes/index.js"].renderCommentNode.callArgs[0][2], fakeMap);
  strictEqual(mocks["./nodes/index.js"].renderTextNode.callCount, 1);
  strictEqual(mocks["./nodes/index.js"].renderTextNode.callArgs[0][0], childNodes[0]);
  strictEqual(mocks["./nodes/index.js"].renderTextNode.callArgs[0][1], fakeValues);
  strictEqual(mocks["./nodes/index.js"].renderTextNode.callArgs[0][2], fakeMap);
  strictEqual(mocks["./nodes/index.js"].renderElementNode.callCount, 1);
  strictEqual(mocks["./nodes/index.js"].renderElementNode.callArgs[0][0], childNodes[2]);
  strictEqual(mocks["./nodes/index.js"].renderElementNode.callArgs[0][1], fakeValues);
  strictEqual(mocks["./nodes/index.js"].renderElementNode.callArgs[0][2], fakeMap);
}, {
  category: "component.template.render unit tests"
});
