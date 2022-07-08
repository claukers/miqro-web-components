const {fake, requireMock, before, after} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "template", "render.js");

describe("template.render.unit.test", () => {

  it("isConnected render returns string calls renderTemplate and renderTemplateNodeDiff", async () => {
    const nodeList = ["node1", "node2"];
    const weakMapGet = WeakMap.prototype.get;
    const weakMapSet = WeakMap.prototype.set;
    const getTemplateLocation = fake(() => {

    });
    const renderVDOMDiffOn = fake(async () => {
      return nodeList;
    });
    const template = "template";
    const component = {};
    const renderFunctionResult = {
      template,
      values: {}
    }
    const renderFunction = fake(() => {
      return renderFunctionResult;
    });
    const output = [];
    const output2 = "output2";
    const xmlDocument = "xmlDocument";
    const parseTemplateXMLResult = output;
    const parseTemplateXMLResult2 = output2;
    const parseTemplateXML = fake(() => {
      return parseTemplateXML.callCount > 1 ? parseTemplateXMLResult2 : parseTemplateXMLResult;
    });
    const parseXML = fake(() => {
      return xmlDocument;
    });
    const log = fake(() => {

    });
    const {render} = requireMock(testFilePath, {
      "./vdom/index.js": {
        renderVDOMDiffOn,
        parseTemplateXML
      },
      "../common/index.js": {
        parseXML,
        log,
        weakMapGet,
        weakMapSet,
        LOG_LEVEL: {}
      }
    }, distPath);
    strictEqual(component.innerHTML, undefined);
    const renderOutput = await render(new AbortController(), component, renderFunction);
    strictEqual(renderFunction.callCount, 1);
    strictEqual(parseXML.callCount, 1);
    strictEqual(parseXML.callArgs[0].length, 1);
    strictEqual(parseXML.callArgs[0][0], template);
    strictEqual(parseTemplateXML.callCount, 1);
    strictEqual(parseTemplateXML.callArgs[0].length, 3);
    strictEqual(parseTemplateXML.callArgs[0][0], template);

    strictEqual(renderVDOMDiffOn.callCount, 0);
    renderOutput.apply();

    strictEqual(renderVDOMDiffOn.callCount, 1);
    strictEqual(getTemplateLocation.callCount, 0);
    strictEqual(renderVDOMDiffOn.callArgs[0].length, 3);
    strictEqual(renderVDOMDiffOn.callArgs[0][0], component);
    strictEqual(renderVDOMDiffOn.callArgs[0][1], parseTemplateXMLResult);
    strictEqual(renderVDOMDiffOn.callArgs[0][2], undefined);

    // second call sends oldOutput

    const renderOutput2 = await render(new AbortController(), component, renderFunction);
    renderOutput2.apply();

    strictEqual(renderVDOMDiffOn.callCount, 2);
    strictEqual(getTemplateLocation.callCount, 0);
    strictEqual(renderVDOMDiffOn.callArgs[0].length, 3);
    strictEqual(renderVDOMDiffOn.callArgs[1][0], component);
    strictEqual(renderVDOMDiffOn.callArgs[1][1], parseTemplateXMLResult2);
    strictEqual(renderVDOMDiffOn.callArgs[1][2], parseTemplateXMLResult);
  });

});
