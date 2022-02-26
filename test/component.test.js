const {strictEqual} = require("assert");
const {fake} = require("@miqro/test");

const fakeElement = {
  dispatchEvent: undefined,
  getAttributeNames: undefined,
  getAttribute: undefined,
  querySelectorAll: undefined
}
const fakeObserver = {
  new: undefined,
  observe: undefined,
  disconnect: undefined
}

const fakeEvent = {
  new: undefined
}

Event = class Event {
  constructor() {
    fakeEvent.new(this, ...arguments);
  }
}

HTMLElement = class HTMLElement {
  dispatchEvent() {
    return fakeElement.dispatchEvent(...arguments);
  }

  getAttributeNames() {
    return fakeElement.getAttributeNames(...arguments);
  }

  getAttribute() {
    return fakeElement.getAttribute(...arguments);
  }

  querySelectorAll() {
    return fakeElement.querySelectorAll(...arguments);
  }
}

MutationObserver = class MutationObserver {
  constructor() {
    fakeObserver.new(this, ...arguments);
  }

  observe() {
    return fakeObserver.observe(...arguments);
  }

  disconnect() {
    return fakeObserver.disconnect(...arguments);
  }
}

const {Component} = require("../");

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

  fakeElement.querySelectorAll = fake(() => {
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

  class C extends Component {
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
  }

  strictEqual(fakeEvent.new.callCount, 0);
  strictEqual(fakeDidUpdate.callCount, 0);
  const instance = new C();

  strictEqual(fakeChild.addEventListener.callCount, 0);
  strictEqual(typeof instance.props, "object");
  strictEqual(Object.keys(instance.props).length, 1);
  strictEqual(instance.props.attr1, "attr1Value");
  strictEqual(fakeObserver.new.callCount, 1);
  strictEqual(fakeElement.querySelectorAll.callCount, 0);
  strictEqual(typeof fakeObserver.new.callArgs[0][1], "function");
  strictEqual(fakeObserver.observe.callCount, 1);
  strictEqual(fakeObserver.disconnect.callCount, 0);
  strictEqual(fakeObserver.observe.callArgs[0][0], instance);
  strictEqual(typeof fakeObserver.observe.callArgs[0][1], "object");
  strictEqual(fakeObserver.observe.callArgs[0][1].attributes, true);
  strictEqual(instance.innerHTML, undefined);
  strictEqual(fakeWillMount.callCount, 0);
  strictEqual(fakeDidMount.callCount, 0);
  strictEqual(fakeDidUnMount.callCount, 0);
  strictEqual(fakeRender.callCount, 0);

  strictEqual(fakeDidUpdate.callCount, 0);
  await instance.connectedCallback();
  strictEqual(fakeDidUpdate.callCount, 0);

  strictEqual(fakeEvent.new.callCount, 0);
  strictEqual(fakeElement.dispatchEvent.callCount, 0);

  instance.emit("custom-event");

  strictEqual(fakeElement.dispatchEvent.callCount, 1);
  strictEqual(fakeElement.dispatchEvent.callArgs[0][0], fakeEvent.new.callArgs[0][0]);
  strictEqual(fakeEvent.new.callCount, 1);

  strictEqual(fakeElement.querySelectorAll.callCount, 1);
  strictEqual(fakeElement.querySelectorAll.callArgs[0][0], "*");
  strictEqual(fakeChild.addEventListener.callCount, 1);
  strictEqual(fakeWillMount.callCount, 1);
  strictEqual(fakeDidMount.callCount, 1);
  strictEqual(fakeDidUnMount.callCount, 0);
  strictEqual(fakeRender.callCount, 1);
  strictEqual(fakeObserver.observe.callCount, 2);
  strictEqual(fakeObserver.disconnect.callCount, 0);
  strictEqual(fakeObserver.observe.callArgs[1][0], instance);
  strictEqual(typeof fakeObserver.observe.callArgs[1][1], "object");
  strictEqual(fakeObserver.observe.callArgs[1][1].attributes, true);
  strictEqual(instance.innerHTML, "fakeVal");
  strictEqual(typeof instance.props, "object");

  await instance.setState({
    internalValue: "fakeVal1"
  });
  strictEqual(fakeDidUpdate.callCount, 1);

  strictEqual(instance.innerHTML, "fakeVal1");
  strictEqual(fakeRender.callCount, 2);
  strictEqual(fakeElement.querySelectorAll.callCount, 2);


  await instance.disconnectedCallback();
  strictEqual(fakeDidUpdate.callCount, 1);
  strictEqual(fakeEvent.new.callCount, 1);
  strictEqual(fakeElement.dispatchEvent.callCount, 1);

  strictEqual(fakeCustomHandler.callCount, 1);
  strictEqual(fakeWillMount.callCount, 1);
  strictEqual(fakeDidMount.callCount, 1);
  strictEqual(fakeDidUnMount.callCount, 1);
  strictEqual(fakeElement.querySelectorAll.callCount, 2);
  strictEqual(fakeRender.callCount, 2);
  strictEqual(fakeObserver.observe.callCount, 2);
  strictEqual(fakeObserver.disconnect.callCount, 1);
  strictEqual(fakeObserver.observe.callArgs[1][0], instance);
  strictEqual(typeof fakeObserver.observe.callArgs[1][1], "object");
  strictEqual(fakeObserver.observe.callArgs[1][1].attributes, true);
  strictEqual(instance.innerHTML, "fakeVal1");
  strictEqual(typeof instance.props, "object");


}, {
  category: "component",
  before: async () => {

    fakeEvent.new = fake(() => {

    });

    fakeElement.dispatchEvent = fake(() => {

    });

    fakeElement.getAttributeNames = fake(() => {
      return ["attr1"];
    });

    fakeElement.getAttribute = fake(() => {
      return "attr1Value"
    });

    fakeElement.querySelectorAll = fake(() => {
      return [];
    });

    fakeObserver.new = fake((observer, listener) => {

    });

    fakeObserver.observe = fake(() => {

    });

    fakeObserver.disconnect = fake(() => {

    });
  }
})
