import {Component} from "./lib/index.js";

customElements.define("my-root", class extends Component {
  static template = "root.html";

  constructor() {
    super();
    this.state.offset = {
      gestureOrigin: null,
      x: 0,
      y: 0
    };
    this.state.nodes = [
      {
        name: "A",
        color: "red",
        location: {
          x: 0,
          y: 0
        }
      }
    ];
  }

  mouseOut(ev) {
    ev.preventDefault();
  }

  mouseOver(ev) {
    ev.preventDefault();
  }

  mouseDown(ev) {
    ev.preventDefault();
    this.setState({
      gestureOrigin: {
        x: parseInt(ev.clientX, 10),
        y: parseInt(ev.clientY, 10)
      }
    });
  }

  mouseMove(ev) {
    ev.preventDefault();
    if (this.state.gestureOrigin) {
      const offsetX = this.state.offset.x + (this.state.gestureOrigin.x - ev.clientX);
      const offsetY = this.state.offset.y + (this.state.gestureOrigin.y - ev.clientY);
      this.setState({
        gestureOrigin: {
          x: parseInt(ev.clientX, 10),
          y: parseInt(ev.clientY, 10)
        },
        offset: {
          x: offsetX,
          y: offsetY
        }
      })
    }
  }

  mouseUp(ev) {
    ev.preventDefault();
    this.setState({
      gestureOrigin: null
    });
  }
});
