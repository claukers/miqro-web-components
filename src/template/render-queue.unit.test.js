const {fake, requireMock, before} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "template", "render-queue.js");

describe("template.render-queue.unit.test", () => {
  let oldCustomEvent;
  before(() => {
    oldCustomEvent = globalThis.oldCustomEvent;
    globalThis.CustomEvent = class extends Event{

    }
  });
  after(() => {
    delete globalThis.CustomEvent;
    globalThis.oldCustomEvent = oldCustomEvent;
  });
  it("queue calls render after 0", async () => {
    const renderFunction = fake(() => {

    });
    const renderCallback = fake(() => {

    });
    const hasCache = fake(() => {
      return false
    });
    const render = fake(() => {

    });
    const {queueRender} = requireMock(testFilePath, {
      "./render.js": {
        render,
        hasCache
      }
    }, distPath);

    const component = {};

    queueRender(component, renderFunction, undefined, renderCallback);

    strictEqual(render.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(render.callCount, 1);
    strictEqual(renderCallback.callCount, 1);
    strictEqual(render.callArgs[0][0] instanceof AbortController, true);
    strictEqual(render.callArgs[0][1], component);
    strictEqual(render.callArgs[0][2], renderFunction);
    strictEqual(render.callArgs[0].length, 3);
  });

  it("queue calls render after 0 shadowRoot", async () => {
    const renderFunction = fake(() => {

    });
    const renderCallback = fake(() => {

    });
    const hasCache = fake(() => {
      return false
    });
    const render = fake(() => {

    });

    const realElement = {};
    const shadowRoot = new ShadowRoot();
    shadowRoot.host = realElement;
    const {queueRender} = requireMock(testFilePath, {
      "./render.js": {
        render,
        hasCache
      }
    }, distPath);

    queueRender(shadowRoot, renderFunction, undefined, renderCallback);

    strictEqual(render.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(render.callCount, 1);
    strictEqual(renderCallback.callCount, 1);
    strictEqual(render.callArgs[0][1], shadowRoot);
  });

  it("queue calls render after 0 second calls cancels first but listeners always receive signal", async () => {
    const renderFunction = fake(() => {

    });
    const listener0 = fake(() => {

    });
    const listener = fake(() => {

    });
    const renderCallback = fake(() => {

    });
    const renderCallback0 = fake(() => {

    });
    const hasCache = fake(() => {
      return false
    });
    const render = fake(() => {

    });

    const element = {};
    const {queueRender} = requireMock(testFilePath, {
      "./render.js": {
        render,
        hasCache
      }
    }, distPath);

    queueRender(element, renderFunction, listener0, renderCallback0);
    queueRender(element, renderFunction, listener, renderCallback);

    strictEqual(render.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));

    strictEqual(render.callCount, 1);
    strictEqual(renderCallback.callCount, 1);
    strictEqual(renderCallback0.callCount, 0);
    strictEqual(listener0.callCount, 1);
    strictEqual(listener.callCount, 1);
    strictEqual(render.callArgs[0][1], element);
  });

  it("queue calls render after 0 and apply", async () => {
    const renderFunction = fake(() => {

    });
    const listener0 = fake(() => {

    });
    const listener = fake(() => {

    });
    const renderCallback = fake(() => {

    });
    const renderCallback0 = fake(() => {

    });
    const hasCache = fake(() => {
      return false
    });
    const renderAction = {
      apply: fake(()=>{

      })
    };
    const render = fake(() => {
      return renderAction;
    });

    const element = {};
    const {queueRender} = requireMock(testFilePath, {
      "./render.js": {
        render,
        hasCache
      }
    }, distPath);

    queueRender(element, renderFunction, listener0, renderCallback0);
    queueRender(element, renderFunction, listener, renderCallback);

    strictEqual(render.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));

    strictEqual(render.callCount, 1);
    strictEqual(renderAction.apply.callCount, 1);
    strictEqual(renderCallback.callCount, 1);
    strictEqual(renderCallback0.callCount, 0);
    strictEqual(listener0.callCount, 1);
    strictEqual(listener.callCount, 1);
    strictEqual(render.callArgs[0][1], element);
  });

  it("queue calls render after 0 with renderAction undefined", async () => {
    const renderFunction = fake(() => {

    });
    const listener0 = fake(() => {

    });
    const listener = fake(() => {

    });
    const renderCallback = fake(() => {

    });
    const renderCallback0 = fake(() => {

    });
    const hasCache = fake(() => {
      return false
    });
    const renderAction = undefined;
    const render = fake(() => {
      return renderAction;
    });

    const element = {};
    const {queueRender} = requireMock(testFilePath, {
      "./render.js": {
        render,
        hasCache
      }
    }, distPath);

    queueRender(element, renderFunction, listener0, renderCallback0);
    queueRender(element, renderFunction, listener, renderCallback);

    strictEqual(render.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));

    strictEqual(render.callCount, 1);
    strictEqual(renderCallback.callCount, 1);
    strictEqual(renderCallback0.callCount, 0);
    strictEqual(listener0.callCount, 1);
    strictEqual(listener.callCount, 1);
    strictEqual(render.callArgs[0][1], element);
  });
});
