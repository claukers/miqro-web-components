const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "router", "history.js");

const newFakePopStateEvent = fake(() => {

});

class FakePopStateEvent {
  constructor() {
    newFakePopStateEvent(...arguments);
  }
}

const fakeWindow = {
  history: {
    pushState: fake(() => {

    })
  },
  dispatchEvent: fake(() => {

  })
};

describe("history.unit.test", () => {

  before(async () => {
    delete globalThis.window;
    delete globalThis.PopStateEvent;
    newFakePopStateEvent.reset();
    fakeWindow.history.pushState.reset();
    fakeWindow.dispatchEvent.reset();
    globalThis.window = fakeWindow;
    globalThis.PopStateEvent = FakePopStateEvent;
  });

  after(async () => {
    delete globalThis.window;
    delete globalThis.PopStateEvent;
  });

  it("historyPushPath should pushState on window and dispatch a new PopStateEvent", async () => {
    const BASEPATHRET = "BASEPATHRET";

    const BASE_PATH = fake(() => {
      return BASEPATHRET;
    })
    const path = "path";
    const {historyPushPath} = requireMock(testFilePath, {
      "./utils.js": {
        BASE_PATH
      }
    }, distPath);
    strictEqual(fakeWindow.dispatchEvent.callCount, 0);
    strictEqual(newFakePopStateEvent.callCount, 0);
    strictEqual(fakeWindow.history.pushState.callCount, 0);

    historyPushPath(path);

    strictEqual(fakeWindow.dispatchEvent.callCount, 1);
    strictEqual(newFakePopStateEvent.callArgs[0][0], "popstate");
    strictEqual(newFakePopStateEvent.callArgs[0].length, 1);
    strictEqual(newFakePopStateEvent.callCount, 1);
    strictEqual(fakeWindow.history.pushState.callCount, 1);
    strictEqual(fakeWindow.history.pushState.callArgs[0].length, 3);
    strictEqual(fakeWindow.history.pushState.callArgs[0][0], null);
    strictEqual(fakeWindow.history.pushState.callArgs[0][1], null);
    strictEqual(fakeWindow.history.pushState.callArgs[0][2], `${BASEPATHRET}${path}`);
  });

});
