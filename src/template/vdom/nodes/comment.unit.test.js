const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "template", "vdom", "nodes", "comment.js");


describe("template.nodes.comment unit tests", () => {

  it("template path as not template path", async () => {
    const fakeNode = {
      textContent: "fakeTextContent"
    };
    const fakeValues = {};
    const fakeTokenPath = undefined;
    const getTemplateTokenValue = fake(() => {
      return fakeTokenPath;
    });
    const {renderCommentNode} = requireMock(testFilePath, {
      ["../../utils/index.js"]: {
        getTemplateTokenValue
      },
    }, distPath);

    globalThis.document = {
      createComment: fake(() => {

      })
    };
    const ret = await renderCommentNode(fakeNode, fakeValues);
    strictEqual(ret.length, 1);
    strictEqual(ret[0].textContent, fakeNode.textContent);
    delete globalThis.document;
  });

  it("template path templateLocation as string", async () => {
    const fakeNode = {
      textContent: "fakeTextContent"
    };
    const fakeValues = {};
    const fakeTokenPath = "fakePath";
    const fakeTemplate = "fakeTemplate";
    const fakeRender = "fakeRender";
    const getTemplateTokenValue = fake(() => {
      return fakeTokenPath;
    });
    const getTemplateFromLocation = fake(() => {
      return fakeTemplate;
    });
    const renderTemplate = fake(() => {
      return fakeRender;
    });
    const {renderCommentNode} = requireMock(testFilePath, {
      ["../../utils/index.js"]: {
        getTemplateTokenValue
      },
      ["../../cache.js"]: {
        getTemplateFromLocation
      },
      ["../../render.js"]: {
        renderTemplate
      }
    }, distPath);
    const ret = await renderCommentNode(fakeNode, fakeValues);
    strictEqual(ret, fakeRender);
    strictEqual(getTemplateTokenValue.callCount, 1);
    strictEqual(getTemplateTokenValue.callArgs[0][0], fakeNode.textContent);
    strictEqual(getTemplateFromLocation.callCount, 1);
    strictEqual(getTemplateFromLocation.callArgs[0][0], fakeTokenPath);
    strictEqual(renderTemplate.callCount, 1);
    strictEqual(renderTemplate.callArgs[0][0], fakeTemplate);
  });

  it("template path templateLocation as promise", async () => {
    const fakeNode = {
      textContent: "fakeTextContent"
    };
    const fakeValues = {
      this: {
        refresh: fake(() => {

        })
      }
    };
    const fakeTokenPath = "fakePath";
    const fakeTemplate = "fakeTemplate";
    const fakeRender = "fakeRender";
    const getTemplateTokenValue = fake(() => {
      return fakeTokenPath;
    });
    const getTemplateFromLocation = fake(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fakeTemplate);
        }, 1);
      });
    });
    const renderTemplate = fake(() => {
      return fakeRender;
    });
    const {renderCommentNode} = requireMock(testFilePath, {
      ["../../utils/index.js"]: {
        getTemplateTokenValue
      },
      ["../../cache.js"]: {
        getTemplateFromLocation
      },
      ["../../render.js"]: {
        renderTemplate
      }
    }, distPath);
    const ret = await renderCommentNode(fakeNode, fakeValues);
    console.dir(ret);
    strictEqual(ret.length, 10);
    strictEqual(getTemplateTokenValue.callCount, 1);
    strictEqual(getTemplateTokenValue.callArgs[0][0], fakeNode.textContent);
    strictEqual(getTemplateFromLocation.callCount, 1);
    strictEqual(getTemplateFromLocation.callArgs[0][0], fakeTokenPath);
    strictEqual(renderTemplate.callCount, 1);
    strictEqual(renderTemplate.callArgs[0][0], fakeTemplate);

  });
});
