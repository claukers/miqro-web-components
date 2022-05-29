import {dispose, render} from "./lib/index.js";

const shadowMap = new WeakMap();

customElements.define(class extends HTMLElement {
  constructor() {
    super();
    shadowMap.set(this, this.attachShadow({
      mode: "closed"
    }));
  }

  connectedCallback() {
    const shadowRoot = shadowMap.get(this);
    let text = "";
    let count = 0;
    let showButton = true;
    render(
      shadowRoot,
      '<p>hello</p><p>{text}</p><!--{template.html}--><button data-if="{showButton}" data-on-click="{click}">clicked {count}</button>',
      {
        text,
        count,
        showButton,
        click: () => {
          if (count === 10) {
            showButton = false;
            setTimeout(() => {
              count = 0;
              showButton = true;
              render();
            }, 1000);
          }
          render();
        }
      }
    );
  }

  disconnectedCallback() {
    const shadowRoot = shadowMap.get(this);
    dispose(shadowRoot);
  }
})
