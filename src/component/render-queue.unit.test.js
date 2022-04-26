const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "render-queue.js");

describe("component.render-queue.unit.test", () => {
  it("doesnt queue and clears last one if not connected", async () => {
    const realRender = fake(() => {

    });
    const renderCallback1 = fake(() => {

    });

    const renderCallback2 = fake(() => {

    });

    const renderCallback3 = fake(() => {

    });

    const renderCallback4 = fake(() => {

    });
    const {render} = requireMock(testFilePath, {
      "./render.js": {
        render: realRender
      }
    }, distPath);

    const component = {
      isConnected: true
    };

    render(component, renderCallback1);

    strictEqual(realRender.callCount, 0);
    strictEqual(renderCallback1.callCount, 0);
    strictEqual(renderCallback2.callCount, 0);
    strictEqual(renderCallback3.callCount, 0);
    strictEqual(renderCallback4.callCount, 0);
    component.isConnected = false;

    render(component, renderCallback2);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(realRender.callCount, 0);
    strictEqual(renderCallback1.callCount, 0);
    strictEqual(renderCallback2.callCount, 0);
    strictEqual(renderCallback3.callCount, 0);
    strictEqual(renderCallback4.callCount, 0);

    component.isConnected = true;

    render(component, renderCallback3);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(realRender.callCount, 1);
    strictEqual(renderCallback1.callCount, 0);
    strictEqual(renderCallback2.callCount, 0);
    strictEqual(renderCallback3.callCount, 1);
    strictEqual(renderCallback4.callCount, 0);

    render(component, renderCallback4);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(realRender.callCount, 2);
    strictEqual(renderCallback1.callCount, 0);
    strictEqual(renderCallback2.callCount, 0);
    strictEqual(renderCallback3.callCount, 1);
    strictEqual(renderCallback4.callCount, 1);


  });

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

    render(component, renderCallback);

    strictEqual(realRender.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(realRender.callCount, 1);
    strictEqual(renderCallback.callCount, 1);
    strictEqual(realRender.callArgs[0][0], component);
  });

  it("queue doesn't call render after 0 when not connected", async () => {
    const realRender = fake(() => {

    });
    const renderCallback = fake(() => {

    });

    const component = {
      isConnected: false
    }
    const {render} = requireMock(testFilePath, {
      "./render.js": {
        render: realRender
      }
    }, distPath);

    render(component, renderCallback);

    strictEqual(realRender.callCount, 0);
    strictEqual(renderCallback.callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 0));
    strictEqual(realRender.callCount, 0);
    strictEqual(renderCallback.callCount, 0);

  });
});
