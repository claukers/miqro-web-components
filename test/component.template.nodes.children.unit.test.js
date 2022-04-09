const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");

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
    ["./element.js"]: {
      renderElementNode: fake(() => {
        return elementRet;
      })
    },
    ["./comment.js"]: {
      renderCommentNode: fake(() => {
        return commentRet;
      })
    },
    ["./text.js"]: {
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
  } = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "template", "nodes", "children.js"), mocks, resolve(__dirname, "..", "dist"));
  const ret = renderNodeChildrenOnElement(childNodes, fakeValues, fakeMap);
  strictEqual(ret.length, 6);
  strictEqual(ret[0], "5");
  strictEqual(ret[1], "6");
  strictEqual(ret[2], "3");
  strictEqual(ret[3], "4");
  strictEqual(ret[4], "1");
  strictEqual(ret[5], "2");
  strictEqual(mocks["./comment.js"].renderCommentNode.callCount, 1);
  strictEqual(mocks["./comment.js"].renderCommentNode.callArgs[0][0], childNodes[1]);
  strictEqual(mocks["./comment.js"].renderCommentNode.callArgs[0][1], fakeValues);
  strictEqual(mocks["./comment.js"].renderCommentNode.callArgs[0][2], fakeMap);
  strictEqual(mocks["./text.js"].renderTextNode.callCount, 1);
  strictEqual(mocks["./text.js"].renderTextNode.callArgs[0][0], childNodes[0]);
  strictEqual(mocks["./text.js"].renderTextNode.callArgs[0][1], fakeValues);
  strictEqual(mocks["./text.js"].renderTextNode.callArgs[0][2], fakeMap);
  strictEqual(mocks["./element.js"].renderElementNode.callCount, 1);
  strictEqual(mocks["./element.js"].renderElementNode.callArgs[0][0], childNodes[2]);
  strictEqual(mocks["./element.js"].renderElementNode.callArgs[0][1], fakeValues);
  strictEqual(mocks["./element.js"].renderElementNode.callArgs[0][2], fakeMap);
}, {
  category: "component.template.nodes.children unit tests"
});
