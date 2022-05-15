const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "template", "nodes", "element.js");


describe("template.nodes.element unit tests", () => {

  function happyPath(show, dataIfRet, dataIfnRet) {
    return async () => {
      const fakeNode = {};
      const fakeValues = {};
      const fakeNodeFE = {
        tagName: "fakeTagName",
        childNodes: "fakeChildNodes"
      };
      const fakeValuesFE = {};
      const createElementRet = {
        appendChild: fake(() => {

        })
      };
      const renderChildNodesRet = ["fakeRender1", "fakeRender2"];
      globalThis.document = {
        createElement: fake(() => {
          return createElementRet;
        })
      };
      const dataForEach = fake((node, values, cb) => {
        cb(fakeNodeFE, fakeValuesFE);
      });
      const dataIf = fake(() => {
        return dataIfRet;
      });
      const dataIfn = fake(() => {
        return dataIfnRet;
      });
      const dataState = fake(() => {
      });
      const dataRef = fake(() => {
      });
      const dataOnAndOtherAttributes = fake(() => {

      });
      const renderChildNodes = fake(() => {
        return renderChildNodesRet;
      });
      const {renderElementNode} = requireMock(testFilePath, {
        ["../attributes/index.js"]: {
          dataForEach,
          dataIf,
          dataIfn,
          dataState,
          dataRef,
          dataOnAndOtherAttributes
        },
        ["../render-children.js"]: {
          renderChildNodes
        }
      }, distPath);
      renderElementNode(fakeNode, fakeValues);
      strictEqual(dataForEach.callCount, 1);
      strictEqual(dataForEach.callArgs[0][0], fakeNode);
      strictEqual(dataForEach.callArgs[0][1], fakeValues);
      strictEqual(dataIf.callCount, 1);
      strictEqual(dataIf.callArgs[0][0], fakeNodeFE);
      strictEqual(dataIf.callArgs[0][1], fakeValuesFE);
      if (dataIfRet) {
        strictEqual(dataIfn.callCount, 1);
        strictEqual(dataIfn.callArgs[0][0], fakeNodeFE);
        strictEqual(dataIfn.callArgs[0][1], fakeValuesFE);
      } else {
        strictEqual(dataIfn.callCount, 0);
      }

      if (show) {
        /*strictEqual(document.createElement.callCount, 1);
        strictEqual(document.createElement.callArgs[0][0], fakeNodeFE.tagName);*/
        strictEqual(dataState.callCount, 1);
        strictEqual(dataState.callArgs[0][0], fakeNodeFE);
        strictEqual(dataState.callArgs[0][1], fakeValuesFE);
        //strictEqual(dataState.callArgs[0][2], createElementRet);
        strictEqual(dataRef.callCount, 1);
        strictEqual(dataRef.callArgs[0][0], fakeNodeFE);
        strictEqual(dataRef.callArgs[0][1], fakeValuesFE);
        //strictEqual(dataRef.callArgs[0][2], createElementRet);
        strictEqual(dataOnAndOtherAttributes.callCount, 1);
        strictEqual(dataOnAndOtherAttributes.callArgs[0][0], fakeNodeFE);
        strictEqual(dataOnAndOtherAttributes.callArgs[0][1], fakeValuesFE);
        //strictEqual(dataOnAndOtherAttributes.callArgs[0][2], createElementRet);
        strictEqual(renderChildNodes.callCount, 1);
        strictEqual(renderChildNodes.callArgs[0][0], fakeNodeFE.childNodes);
        strictEqual(renderChildNodes.callArgs[0][1], fakeValuesFE);
        //strictEqual(createElementRet.appendChild.callCount, 2);
        //strictEqual(createElementRet.appendChild.callArgs[0][0], renderChildNodesRet[0]);
        //strictEqual(createElementRet.appendChild.callArgs[1][0], renderChildNodesRet[1]);
      } else {
        //strictEqual(document.createElement.callCount, 0);
        strictEqual(dataState.callCount, 0);
        strictEqual(dataRef.callCount, 0);
        strictEqual(dataOnAndOtherAttributes.callCount, 0);
        strictEqual(renderChildNodes.callCount, 0);
      }

      delete globalThis.document;
    }
  }

  it("dataIf returns true dataIfn return true", happyPath(true, true, true));

  it("dataIf returns false dataIfn return true", happyPath(false, false, true));

  it("dataIf returns true dataIfn return false", happyPath(false, true, false));

  it("dataIf returns false dataIfn return false", happyPath(false, false, false));

});
