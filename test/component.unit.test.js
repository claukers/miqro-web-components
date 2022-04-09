const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");

HTMLElement = class {

}

it("connectCallback should call render", async () => {
  const render = fake(() => {

  });
  const {Component} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "component.js"), {
    "./render.js": {
      render
    }
  }, resolve(__dirname, "..", "dist"));

  const component = new Component();
  component.connectedCallback();
  strictEqual(render.callCount, 1);
  strictEqual(render.callArgs[0][0], component);
}, {
  category: "component.unit.test"
});

it("setState shouldn't render when didUpdate returns false", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return false;
  });
  const {Component} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "component.js"), {
    "./render.js": {
      render
    }
  }, resolve(__dirname, "..", "dist"));

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
}, {
  category: "component.unit.test"
});

it("setState shouldn't call render when didUpdate returns true and is not connected", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return true;
  });
  const {Component} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "component.js"), {
    "./render.js": {
      render
    }
  }, resolve(__dirname, "..", "dist"));

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
}, {
  category: "component.unit.test"
});

it("setState shouldn't call render when didUpdate returns true and is connected and refresh = false", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return true;
  });
  const {Component} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "component.js"), {
    "./render.js": {
      render
    }
  }, resolve(__dirname, "..", "dist"));

  const component = new (class extends Component {
    didUpdate() {
      return didUpdate(...arguments);
    }
  });
  component.isConnected = true;
  component.setState({
    someValue: 1
  }, false);
  strictEqual(didUpdate.callCount, 1);
  strictEqual(render.callCount, 0);
}, {
  category: "component.unit.test"
});

it("setState should call render when didUpdate returns true and is connected", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return true;
  });
  const {Component} = requireMock(resolve(__dirname, "..", "dist", "cjs", "component", "component.js"), {
    "./render.js": {
      render
    }
  }, resolve(__dirname, "..", "dist"));

  const component = new (class extends Component {
    didUpdate() {
      return didUpdate(...arguments);
    }
  });
  component.isConnected = true;
  component.setState({
    someValue: 1
  });
  strictEqual(didUpdate.callCount, 1);
  strictEqual(render.callCount, 1);
}, {
  category: "component.unit.test"
});