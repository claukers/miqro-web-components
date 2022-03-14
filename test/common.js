const {fake} = require("@miqro/test");
const defaultFakes = {
  document: {
    documentElement: {
      getAttribute: fake(() => {
        return null;
      })
    }
  },
  Element: {
    dispatchEvent: fake(() => {
      return;
    }),
    getAttributeNames: fake(() => {
      return [];
    }),
    getAttribute: fake(() => {
      return null;
    }),
    querySelectorAll: fake(() => {
      return [];
    }),
    addEventListener: fake(() => {

    })
  },
  Event: {
    new: fake(() => {
    })
  }
}
const fakes = {
  reset: () => {
    fakes.document = {
      ...defaultFakes.document
    };
    fakes.Element = {
      ...defaultFakes.Element
    };
    fakes.Event = {
      ...defaultFakes.Event
    };
  }
};
fakes.reset();
module.exports = {
  initDOMGlobals: () => {
    CustomEvent = class CustomEvent {
      constructor(eventName, options) {
        this.eventName = eventName;
        this.detail = options ? options.detail : undefined;
        fakes.Event.new(this, ...arguments);
      }
    }

    document = fakes.document;

    HTMLElement = class HTMLElement {
      dispatchEvent() {
        return fakes.Element.dispatchEvent(...arguments);
      }

      getAttributeNames() {
        return fakes.Element.getAttributeNames(...arguments);
      }

      getAttribute() {
        return fakes.Element.getAttribute(...arguments);
      }

      querySelectorAll() {
        return fakes.Element.querySelectorAll(...arguments);
      }

      addEventListener() {
        return fakes.Element.addEventListener(...arguments);
      }
    }
    return fakes;
  }
}
