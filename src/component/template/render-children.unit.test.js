const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "template", "render-children.js");

describe("template.render-children unit tests", () => {
  
  it("render text, comment, element nodes, ignore others and concat results", async () => {
    Node = {
      COMMENT_NODE: "COMMENT_NODE",
      TEXT_NODE: "TEXT_NODE",
      ELEMENT_NODE: "ELEMENT_NODE",
      OTHER: "OTHER"
    }
    const fakeValues = "fakeValues";
    const elementRet = ["1", "2"];
    const commentRet = ["3", "4"];
    const textRet = ["5", "6"];
    const mocks = {
      ["./vdom/nodes/index.js"]: {
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
      renderChildNodes
    } = requireMock(testFilePath, mocks, distPath);
    const ret = await renderChildNodes(childNodes, fakeValues);
    strictEqual(ret.length, 6);
    strictEqual(ret[0], "5");
    strictEqual(ret[1], "6");
    strictEqual(ret[2], "3");
    strictEqual(ret[3], "4");
    strictEqual(ret[4], "1");
    strictEqual(ret[5], "2");
    strictEqual(mocks["./vdom/nodes/index.js"].renderCommentNode.callCount, 1);
    strictEqual(mocks["./vdom/nodes/index.js"].renderCommentNode.callArgs[0][0], childNodes[1]);
    strictEqual(mocks["./vdom/nodes/index.js"].renderCommentNode.callArgs[0][1], fakeValues);
    strictEqual(mocks["./vdom/nodes/index.js"].renderTextNode.callCount, 1);
    strictEqual(mocks["./vdom/nodes/index.js"].renderTextNode.callArgs[0][0], childNodes[0]);
    strictEqual(mocks["./vdom/nodes/index.js"].renderTextNode.callArgs[0][1], fakeValues);
    strictEqual(mocks["./vdom/nodes/index.js"].renderElementNode.callCount, 1);
    strictEqual(mocks["./vdom/nodes/index.js"].renderElementNode.callArgs[0][0], childNodes[2]);
    strictEqual(mocks["./vdom/nodes/index.js"].renderElementNode.callArgs[0][1], fakeValues);
  });
});
