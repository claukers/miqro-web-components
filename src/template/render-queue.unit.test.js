const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "render-queue.js");

describe("component.render-queue.unit.test", () => {
  it("queue calls render after 0 when connected", async () => {
    const realRender = fake(() => {

    });
    const renderCallback = fake(() => {

    });
    const component = {
      isConnected: true
    }
    const {render} = requireMock(testFilePath, {
      "./render.js": {
        render: realRender
      }
    }, distPath);

    render(component, undefined, undefined, renderCallback);

    strictEqual(realRender.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(realRender.callCount, 1);
    strictEqual(renderCallback.callCount, 1);
    strictEqual(realRender.callArgs[0][0], component);
  });

  it("queue two times on components calls render one time", async () => {
    const realRender = fake(() => {

    });
    const renderCallback1 = fake(() => {

    });
    const renderCallback2 = fake(() => {

    });

    const component = {
      isConnected: true
    }
    const {render} = requireMock(testFilePath, {
      "./render.js": {
        render: realRender
      }
    }, distPath);

    render(component, undefined, undefined, renderCallback1);
    render(component, undefined, undefined, renderCallback2);

    strictEqual(realRender.callCount, 0);
    strictEqual(renderCallback1.callCount, 0);
    strictEqual(renderCallback2.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(realRender.callCount, 1);
    strictEqual(renderCallback1.callCount, 1);
    strictEqual(renderCallback2.callCount, 1);

  });
});
