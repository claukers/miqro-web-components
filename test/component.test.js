const {strictEqual} = require("assert");
const {fake, requireMock} = require("@miqro/test");
const {initDOMGlobals} = require("./common");
const fakes = initDOMGlobals();
const {decodeHtml, Component} = requireMock("../", {});

const testOptions = {
  category: "component",
  before: async () => {

    fakes.Event.new = fake(() => {

    });

    fakes.Element.dispatchEvent = fake(() => {

    });

    fakes.Element.getAttributeNames = fake(() => {
      return ["attr1"];
    });

    fakes.Element.getAttribute = fake(() => {
      return "attr1Value"
    });

    fakes.Element.querySelectorAll = fake(() => {
      return [];
    });

    fakes.MutationObserver.new = fake((observer, listener) => {

    });

    fakes.MutationObserver.observe = fake(() => {

    });

    fakes.MutationObserver.disconnect = fake(() => {

    });
  }
};

it("happy path lifecycle with custom handler and template as simple value", async () => {

  const fakeChild = new HTMLElement();
  fakeChild.getAttributeNames = fake(() => {
    return ["data-on-custom-event"];
  });

  fakeChild.getAttribute = fake(() => {
    return "{customHandler}"
  });

  fakeChild.addEventListener = fake(() => {

  });

  fakes.Element.querySelectorAll = fake(() => {
    return [fakeChild];
  });

  const fakeRender = fake(() => {
    return "{state.internalValue}";
  });

  const fakeWillMount = fake(() => {

  });

  const fakeDidMount = fake(() => {

  });

  const fakeDidUnMount = fake(() => {

  });

  const fakeCustomHandler = fake(() => {

  });

  const fakeDidUpdate = fake(() => {
    return true;
  });

  strictEqual(fakes.Event.new.callCount, 0);
  strictEqual(fakeDidUpdate.callCount, 0);
  const instance = new (class extends Component {
    constructor() {
      super();
      this.state = {
        internalValue: "fakeVal"
      }
    }

    render() {
      return fakeRender();
    }

    customHandler() {
      return fakeCustomHandler(...arguments);
    }

    willMount() {
      strictEqual(fakeChild.addEventListener.callCount, 0);
      return fakeWillMount();
    }

    didUpdate() {
      return fakeDidUpdate(...arguments);
    }

    didMount() {
      strictEqual(fakeChild.addEventListener.callCount, 1);
      strictEqual(fakeChild.addEventListener.callArgs[0][0], "custom-event");
      strictEqual(typeof fakeChild.addEventListener.callArgs[0][1], "function");
      strictEqual(fakeCustomHandler.callCount, 0);

      fakeChild.addEventListener.callArgs[0][1]("fakefakefakeArgs");

      strictEqual(fakeCustomHandler.callCount, 1);
      strictEqual(fakeCustomHandler.callArgs[0][0], "fakefakefakeArgs");
      return fakeDidMount();
    }

    didUnMount() {
      return fakeDidUnMount();
    }
  })();

  strictEqual(fakeChild.addEventListener.callCount, 0);
  strictEqual(fakes.Element.querySelectorAll.callCount, 0);
  strictEqual(instance.innerHTML, undefined);
  strictEqual(fakeWillMount.callCount, 0);
  strictEqual(fakeDidMount.callCount, 0);
  strictEqual(fakeDidUnMount.callCount, 0);
  strictEqual(fakeRender.callCount, 0);

  strictEqual(fakeDidUpdate.callCount, 0);
  instance.isConnected = true;
  await instance.connectedCallback();
  strictEqual(fakeDidUpdate.callCount, 0);

  strictEqual(fakes.Event.new.callCount, 0);
  strictEqual(fakes.Element.dispatchEvent.callCount, 0);

  instance.emit("custom-event");

  strictEqual(fakes.Element.dispatchEvent.callCount, 1);
  strictEqual(fakes.Element.dispatchEvent.callArgs[0][0], fakes.Event.new.callArgs[0][0]);
  strictEqual(fakes.Event.new.callCount, 1);

  strictEqual(fakes.Element.querySelectorAll.callCount, 1);
  strictEqual(fakes.Element.querySelectorAll.callArgs[0][0], "*");
  strictEqual(fakeChild.addEventListener.callCount, 1);
  strictEqual(fakeWillMount.callCount, 1);
  strictEqual(fakeDidMount.callCount, 1);
  strictEqual(fakeDidUnMount.callCount, 0);
  strictEqual(fakeRender.callCount, 1);
  strictEqual(decodeHtml(instance.innerHTML), "fakeVal");
  strictEqual(typeof instance.props, "object");

  await instance.setState({
    internalValue: "fakeVal1"
  });
  strictEqual(fakeDidUpdate.callCount, 1);

  strictEqual(decodeHtml(instance.innerHTML), "fakeVal1");
  strictEqual(fakeRender.callCount, 2);
  strictEqual(fakes.Element.querySelectorAll.callCount, 2);

  instance.isConnected = false;
  await instance.disconnectedCallback();
  strictEqual(fakeDidUpdate.callCount, 1);
  strictEqual(fakes.Event.new.callCount, 1);
  strictEqual(fakes.Element.dispatchEvent.callCount, 1);

  strictEqual(fakeCustomHandler.callCount, 1);
  strictEqual(fakeWillMount.callCount, 1);
  strictEqual(fakeDidMount.callCount, 1);
  strictEqual(fakeDidUnMount.callCount, 1);
  strictEqual(fakes.Element.querySelectorAll.callCount, 2);
  strictEqual(fakeRender.callCount, 2);
  strictEqual(decodeHtml(instance.innerHTML), "fakeVal1");
  strictEqual(typeof instance.props, "object");


}, testOptions);
