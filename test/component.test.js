const {strictEqual} = require("assert");
const {fake, requireMock} = require("@miqro/test");
const {initDOMGlobals} = require("./common");
const fakes = initDOMGlobals();
const {decodeHTML, Component} = requireMock("../", {});

const testOptions = {
  category: "component",
  before: async () => {

    fakes.Event.new = fake(() => {

    });

    fakes.Element.dispatchEvent = fake(() => {

    });

    fakes.Element.getAttributeNames = fake(() => {
      return [];
    });

    fakes.Element.getAttribute = fake(() => {
      return undefined;
    });

    fakes.Element.querySelectorAll = fake(() => {
      return [];
    });

    fakes.Element.addEventListener = fake(() => {

    });
  }
};

it("happy path ctor and connectCallback and setState with very simple template", async () => {
  const instance = new (class extends Component {
    constructor() {
      super();
      this.state = {
        text: "hello",
        textClass: "custom-class"
      }
      this.render = fake(() => {
        return `<p class="{state.textClass}">{state.text}</p>`
      });
    }

    querySelectorAll(args) {
      strictEqual(args, "*");
      return [
        {
          getAttributeNames: fake(() => {
            return ["class"];
          }),
          getAttribute: fake((arg) => {
            strictEqual(arg, "class");
            return "custom-class";
          })
        }
      ]
    }
  })();

  strictEqual(typeof instance.innerHtml, "undefined");
  strictEqual(typeof instance.state, "object");
  strictEqual(instance.render.callCount, 0);

  instance.isConnected = true;
  instance.connectedCallback();

  strictEqual(typeof instance.innerHTML, "string");
  strictEqual(instance.render.callCount, 1);
  strictEqual(decodeHTML(instance.innerHTML), `<p class="custom-class">hello</p>`);

  instance.setState({
    text: "world"
  });

  strictEqual(typeof instance.innerHTML, "string");
  strictEqual(instance.render.callCount, 2);
  strictEqual(decodeHTML(instance.innerHTML), `<p class="custom-class">world</p>`);
}, testOptions);

it("happy path custom event data-on-custom-event and emit(custom-event)", async () => {
  const eventListener = fake((ev) => {
    strictEqual(ev, "alskdjadlk");
  });
  const fakeChild = {
    getAttributeNames: fake(() => {
      return ["class", "data-on-custom-event"];
    }),
    getAttribute: fake((arg) => {
      switch (arg) {
        case "class":
          return "custom-class";
        case "data-on-custom-event":
          return "{eventHandler}"; // because of function it should not have change on the template render see template.test.js
        default:
          strictEqual(false, true);
      }
    }),
    addEventListener: fake((event, listener) => {
      strictEqual(event, "custom-event");
      strictEqual(eventListener.callCount, 0);
      listener("alskdjadlk");
      strictEqual(eventListener.callCount, 1);
    })
  };
  const instance = new (class extends Component {
    constructor() {
      super();
      this.state = {
        text: "hello",
        textClass: "custom-class"
      }
      this.dispatchEvent = fake((event) => {
        strictEqual(event instanceof Event, true);
        strictEqual(event.eventName, "custom-event");
      });
    }

    querySelectorAll(args) {
      strictEqual(args, "*");
      return [fakeChild];
    }

    eventHandler(ev) {
      eventListener(ev);
    }

    render() {
      strictEqual(fakeChild.addEventListener.callCount, 0);
      return `<p class="{state.textClass}" data-on-custom-event="{eventHandler}">{state.text}</p>`
    }
  })();

  strictEqual(typeof instance.innerHtml, "undefined");
  strictEqual(typeof instance.state, "object");

  instance.isConnected = true;
  instance.connectedCallback();
  strictEqual(fakeChild.addEventListener.callCount, 1);

  strictEqual(typeof instance.innerHTML, "string");
  strictEqual(decodeHTML(instance.innerHTML), `<p class="custom-class" data-on-custom-event="{eventHandler}">hello</p>`);

  strictEqual(instance.dispatchEvent.callCount, 0);
  strictEqual(fakes.Event.new.callCount, 0);
  instance.emit("custom-event");
  strictEqual(fakes.Event.new.callCount, 1);
  strictEqual(instance.dispatchEvent.callCount, 1);
  instance.emit("custom-event");
  strictEqual(fakes.Event.new.callCount, 1); // uses cache!
  strictEqual(instance.dispatchEvent.callCount, 2);
}, testOptions);
