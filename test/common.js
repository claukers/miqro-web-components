module.exports = {
  initDOMGlobals: () => {
    const fakes = {
      Element: {
        dispatchEvent: undefined,
        getAttributeNames: undefined,
        getAttribute: undefined,
        querySelectorAll: undefined
      },
      MutationObserver: {
        new: undefined,
        observe: undefined,
        disconnect: undefined
      },
      Event: {
        new: undefined
      }
    };
    Event = class Event {
      constructor() {
        fakes.Event.new(this, ...arguments);
      }
    }

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
    }

    MutationObserver = class MutationObserver {
      constructor() {
        fakes.MutationObserver.new(this, ...arguments);
      }

      observe() {
        return fakes.MutationObserver.observe(...arguments);
      }

      disconnect() {
        return fakes.MutationObserver.disconnect(...arguments);
      }
    }
    return fakes;
  }
}
