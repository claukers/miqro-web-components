const {fake} = require("@miqro/test");
module.exports = {
  initDOMGlobals: () => {
    const fakes = {
      document: {
        documentElement: {
          getAttribute: fake(() => {
            return null;
          })
        }
      },
      Element: {
        dispatchEvent: undefined,
        getAttributeNames: undefined,
        getAttribute: undefined,
        querySelectorAll: undefined,
        addEventListener: undefined
      },
      Event: {
        new: undefined
      }
    };
    Event = class Event {
      constructor(eventName) {
        this.eventName = eventName;
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
