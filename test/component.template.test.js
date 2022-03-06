const {strictEqual} = require("assert");
const {fake, requireMock} = require("@miqro/test");
const {initDOMGlobals} = require("./common");
const fakes = initDOMGlobals();
const {decodeHTML, Component} = requireMock("../", {});

const testOptions = {
  category: "component.template",
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

it("happy path template avoid functions", async () => {
  const instance = new (class extends Component {
    constructor() {
      super();
      this.state = {
        cb: () => {

        },
        text: "hello",
        textClass: "custom-class"
      }
      this.render = fake(() => {
        return `<p class="{state.textClass}" data-on-click="{state.cb}">{state.text}{state.cb}</p>`
      });
    }
  })();
  strictEqual(instance.render.callCount, 0);
  strictEqual(instance.innerHTML, undefined);
  instance.connectedCallback();
  strictEqual(instance.render.callCount, 1);
  strictEqual(decodeHTML(instance.innerHTML), `<p class="custom-class" data-on-click="{state.cb}">hello{state.cb}</p>`);
}, testOptions);
