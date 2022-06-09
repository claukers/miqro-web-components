import {Component, setLogLevel} from "./lib/index.js";

setLogLevel("debug");

customElements.define("node-element", class extends Component {
  constructor() {
    super();
    this.state.position = {
      left: parseInt(this.dataset.x, 10) + parseInt(this.dataset.offsetX, 10),
      top: parseInt(this.dataset.y, 10) + parseInt(this.dataset.offsetY, 10)
    };
    this.state.selected = this.dataset.selected === "true" ? true : false;
  }

  static get observedAttributes() {
    return [
      'data-node-name',
      'data-y',
      'data-x',
      'data-offset-x',
      'data-offset-y',
      'data-selected'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-node-name") {
      this.refresh();
    } else if (name === "data-selected") {
      this.setState({
        selected: this.dataset.selected === "true" ? true : false
      })
    } else {
      this.setState({
        position: {
          left: parseInt(this.dataset.x, 10) - parseInt(this.dataset.offsetX, 10),
          top: parseInt(this.dataset.y, 10) - parseInt(this.dataset.offsetY, 10)
        }
      });
    }
  }

  mouseDown(ev) {
    ev.preventDefault();
  }

  render() {
    return "<!--{node.html}-->"
  }
});
