export function define(tag, hook) {
  customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {

    }

    disconnectedCallback() {

    }
  });
}

export function useState(defaultValue) {
  let tmp = undefined;
  return {
    get value() {
      return tmp ? tmp : defaultValue;
    },
    set value(val) {
      tmp = val;
      return tmp ? tmp : defaultValue;
    }
  }
}
