import {Component} from "./lib/index.js";

customElements.define("node-element", class extends Component {
  static template = "node.html";
  constructor() {
    super();
    this.state.position = {
      left: parseInt(this.dataset.x, 10) + parseInt(this.dataset.offsetX, 10),
      top: parseInt(this.dataset.y, 10) + parseInt(this.dataset.offsetY, 10)
    };
  }

  static get observedAttributes() {
    return [
      'data-node-name',
      'data-node-y',
      'data-node-x',
      'data-offset-x',
      'data-offset-y'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-node-name") {
      this.refresh();
    } else {
      this.setState({
        position: {
          left: parseInt(this.dataset.x, 10) + parseInt(this.dataset.offsetX, 10),
          top: parseInt(this.dataset.y, 10) + parseInt(this.dataset.offsetY, 10)
        }
      });
    }
  }

  mouseDown(ev) {
    ev.preventDefault();
  }
});
