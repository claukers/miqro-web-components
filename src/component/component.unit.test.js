const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "component.js");

const testOptions = {
  category: "component.unit.test"
};

HTMLElement = class {

}

it("connectCallback should call render", async () => {
  const render = fake(() => {

  });
  const {Component} = requireMock(testFilePath, {
    "./render.js": {
      render
    }
  }, distPath);

  const component = new Component();
  component.connectedCallback();
  strictEqual(render.callCount, 1);
  strictEqual(render.callArgs[0][0], component);
}, testOptions);

it("setState shouldn't render when didUpdate returns false", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return false;
  });
  const {Component} = requireMock(testFilePath, {
    "./render.js": {
      render
    }
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
}, testOptions);

it("setState shouldn't call render when didUpdate returns true and is not connected", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return true;
  });
  const {Component} = requireMock(testFilePath, {
    "./render.js": {
      render
    }
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
}, testOptions);

it("setState shouldn't call render when didUpdate returns true and is connected and refresh = false", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return true;
  });
  const {Component} = requireMock(testFilePath, {
    "./render.js": {
      render
    }
  }, distPath);

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
}, testOptions);

it("setState should call render when didUpdate returns true and is connected", async () => {
  const render = fake(() => {

  });
  const didUpdate = fake(() => {
    return true;
  });
  const {Component} = requireMock(testFilePath, {
    "./render.js": {
      render
    }
  }, distPath);

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
}, testOptions);
