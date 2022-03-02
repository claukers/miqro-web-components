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
  strictEqual(typeof instance.props, "object");
  strictEqual(Object.keys(instance.props).length, 1);
  strictEqual(instance.props.attr1, "attr1Value");
  strictEqual(fakes.MutationObserver.new.callCount, 1);
  strictEqual(fakes.Element.querySelectorAll.callCount, 0);
  strictEqual(typeof fakes.MutationObserver.new.callArgs[0][1], "function");
  strictEqual(fakes.MutationObserver.observe.callCount, 0);
  strictEqual(fakes.MutationObserver.disconnect.callCount, 0);
  strictEqual(instance.innerHTML, undefined);
  strictEqual(fakeWillMount.callCount, 0);
  strictEqual(fakeDidMount.callCount, 0);
  strictEqual(fakeDidUnMount.callCount, 0);
  strictEqual(fakeRender.callCount, 0);

  strictEqual(fakeDidUpdate.callCount, 0);
  instance.isConnected = true;
  await instance.connectedCallback();
  strictEqual(fakeDidUpdate.callCount, 0);
  strictEqual(fakes.MutationObserver.observe.callCount, 1);
  strictEqual(fakes.MutationObserver.observe.callArgs[0][0], instance);
  strictEqual(typeof fakes.MutationObserver.observe.callArgs[0][1], "object");
  strictEqual(fakes.MutationObserver.observe.callArgs[0][1].attributes, true);

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
  strictEqual(fakes.MutationObserver.observe.callCount, 1);
  strictEqual(fakes.MutationObserver.disconnect.callCount, 0);
  strictEqual(fakes.MutationObserver.observe.callArgs[0][0], instance);
  strictEqual(typeof fakes.MutationObserver.observe.callArgs[0][1], "object");
  strictEqual(fakes.MutationObserver.observe.callArgs[0][1].attributes, true);
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
  strictEqual(fakes.MutationObserver.observe.callCount, 1);
  strictEqual(fakes.MutationObserver.disconnect.callCount, 1);
  strictEqual(decodeHtml(instance.innerHTML), "fakeVal1");
  strictEqual(typeof instance.props, "object");


}, testOptions);

it("happy path lifecycle props as object", async () => {


  const instance = new (class extends Component {
    constructor() {
      super();
      this.state = {
        internalObject: {
          attr1: 1,
          attr2: "value2",
          attrCB: fake(() => {

          })
        }
      }
    }

    render() {
      return "";
    }
  })();

  const fakeSetProps = fake((p) => {
    strictEqual(p["data-custom-object"].attr1, 1);
    strictEqual(p["data-custom-object"].attr2, "value2");
    strictEqual(typeof p["data-custom-object"].attrCB, "function");
  });

  const fakeRender = fake((p) => {
    strictEqual(p["data-custom-object"].attr1, 1);
    strictEqual(p["data-custom-object"].attr2, "value2");
    strictEqual(typeof p["data-custom-object"].attrCB, "function");
    return "";
  });

  const fakeChild = new (class extends Component {
    setProps(p, o, r) {
      fakeSetProps(p);
      super.setProps(p, o, r);
      fakeRender(this.props);
    }
  })()

  fakeChild.querySelectorAll = fake(() => {
    return [];
  });

  fakeChild.getAttributeNames = fake(() => {
    return ["data-custom-object"];
  });

  fakeChild.getAttribute = fake(() => {
    return "{state.internalObject}"
  });

  fakes.Element.querySelectorAll = fake(() => {
    return [fakeChild]
  });

  strictEqual(instance.innerHTML, undefined);
  strictEqual(fakeSetProps.callCount, 0);
  strictEqual(fakeRender.callCount, 0);

  instance.isConnected = true;
  instance.connectedCallback();

  strictEqual(instance.innerHTML, "");
  strictEqual(fakeSetProps.callCount, 1);
  strictEqual(fakeRender.callCount, 1);

}, testOptions);
