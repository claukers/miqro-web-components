const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "component.js");

describe("component.unit.test", () => {


  it("connectCallback should call render and set templateChildren", async () => {
    const render = fake(() => {

    });
    const nodeList2Array = fake(() => {
      return nodeList2ArrayRet;
    });
    const nodeList2ArrayRet = "nodeList2ArrayRet";
    const {Component} = requireMock(testFilePath, {
      "./render-queue.js": {
        render
      },
      "./template/index.js": {
        nodeList2Array
      },
      "../store.js": {}
    }, distPath);

    const component = new Component();
    component.isConnected = true;
    component.childNodes = "childNodes";
    component.connectedCallback();
    strictEqual(render.callCount, 1);
    strictEqual(nodeList2Array.callCount, 1);
    strictEqual(nodeList2Array.callArgs[0][0], component.childNodes);
    strictEqual(component.templateChildren, nodeList2ArrayRet);
    strictEqual(render.callArgs[0][0], component);
  });

  describe("subscribe", () => {
    it("connect should unsubscribe and then subscribe. disconnect should unsubscribe", async () => {

      const nodeList2Array = fake(() => {

      });
      const set = fake(() => {

      });

      const render = fake(() => {

      });

      const dispose = fake(() => {

      });

      const {Component} = requireMock(testFilePath, {
        "./render-queue.js": {
          render
        },
        "./template/index.js": {
          nodeList2Array,
          dispose,
          set
        },
        "../store.js": {}
      }, distPath);

      const component = new Component();
      const store = {
        getState: fake(() => {
          return {
            currentUser: {
              name: "name",
              details: {
                info: "info"
              }
            }
          };
        }),
        subscribe: fake(() => {
          switch (store.subscribe.callCount) {
            case 1:
              strictEqual(store.unSubscribe.callCount, 1);
              break;
            case 2:
              strictEqual(store.unSubscribe.callCount, 2);
              break;
            default:
              strictEqual(true, false);
              break;
          }
        }),
        unSubscribe: fake(() => {
          switch (store.unSubscribe.callCount) {
            case 1:
              strictEqual(store.subscribe.callCount, 0);
              break;
            case 2:
              strictEqual(store.subscribe.callCount, 1);
              break;
            case 3:
            case 4:
              strictEqual(store.subscribe.callCount, 2);
              break;
            default:
              strictEqual(true, false);
              break;
          }
        })
      }

      const userNameSelector = state => state.currentUser.name;
      const userInfoSelector = state => state.currentUser.details.info;
      component.subscribe(store, "user.name", userNameSelector);
      strictEqual(component.storeListeners.length, 1);
      component.subscribe(store, "user.info", userInfoSelector);
      strictEqual(component.storeListeners.length, 2);

      strictEqual(store.subscribe.callCount, 0);
      strictEqual(store.unSubscribe.callCount, 0);

      component.connectedCallback();

      strictEqual(store.unSubscribe.callCount, 2);
      strictEqual(store.unSubscribe.callArgs[0][0], component.storeListeners[0].listener);
      strictEqual(store.unSubscribe.callArgs[1][0], component.storeListeners[1].listener);
      strictEqual(store.subscribe.callCount, 2);
      strictEqual(store.subscribe.callArgs[0][0], userNameSelector);
      strictEqual(store.subscribe.callArgs[1][0], userInfoSelector);

      strictEqual(component.storeListeners.length, 2);

      component.disconnectedCallback();

      strictEqual(dispose.callCount, 1);
      strictEqual(store.subscribe.callCount, 2);
      strictEqual(store.unSubscribe.callCount, 4);
      strictEqual(component.storeListeners.length, 2);
    });
  });

  it("setState shouldn't render when didUpdate returns false", async () => {
    const render = fake(() => {

    });
    const didUpdate = fake(() => {
      return false;
    });
    const {Component} = requireMock(testFilePath, {
      "./render-queue.js": {
        render
      },
      "./template/index.js": {},
      "../store.js": {}
    }, distPath);

    const component = new (class extends Component {
      didUpdate() {
        return didUpdate(...arguments);
      }
    });
    component.setState({
      someValue: 1
    });
    strictEqual(didUpdate.callCount, 1);
    strictEqual(render.callCount, 0);
  });

  it("setState shouldn't call render when didUpdate returns true and is not connected", async () => {
    const render = fake(() => {

    });
    const didUpdate = fake(() => {
      return true;
    });
    const {Component} = requireMock(testFilePath, {
      "./render-queue.js": {
        render
      },
      "./template/index.js": {},
      "../store.js": {}
    }, distPath);

    const component = new (class extends Component {
      didUpdate() {
        return didUpdate(...arguments);
      }
    });
    component.isConnected = false;
    component.setState({
      someValue: 1
    });
    strictEqual(didUpdate.callCount, 1);
    strictEqual(render.callCount, 0);
  });

  it("setState should call render when didUpdate returns true and is connected", async () => {
    const render = fake(() => {

    });
    const didUpdate = fake(() => {
      return true;
    });
    const callback = "callback";
    const {Component} = requireMock(testFilePath, {
      "./render-queue.js": {
        render
      },
      "./template/index.js": {},
      "../store.js": {}
    }, distPath);

    const component = new (class extends Component {
      didUpdate() {
        return didUpdate(...arguments);
      }
    });
    component.isConnected = true;
    component.setState({
      someValue: 1
    }, callback);
    strictEqual(didUpdate.callCount, 1);
    strictEqual(render.callCount, 1);
    strictEqual(render.callArgs[0][0], component);
    strictEqual(render.callArgs[0][3], callback);
  });
});
