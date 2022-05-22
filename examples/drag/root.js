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
        selected: false,
        location: {
          x: 200,
          y: 300
        }
      },
      {
        name: "A",
        color: "green",
        selected: false,
        location: {
          x: 500,
          y: 600
        }
      },
      {
        name: "C",
        color: "blue",
        selected: false,
        location: {
          x: 800,
          y: 150
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

  isMatch(ev, n) {
    const x = (n.location.x - this.state.offset.x);
    const y = (n.location.y - this.state.offset.y);
    const mX = parseInt(ev.clientX, 10);
    const mY = parseInt(ev.clientY, 10);
    const match = mX >= x && mX <= (x + 100) && mY >= y && mY <= y + 100;
    return match;
  }

  mouseDown(ev) {
    ev.preventDefault();
    this.state.nodes.filter(n => this.isMatch(ev, n)).forEach(n => {
      n.selected = true;
    });
    this.setState({
      gestureOrigin: {
        x: parseInt(ev.clientX, 10),
        y: parseInt(ev.clientY, 10)
      },
      nodes: this.state.nodes
    });
  }

  mouseMove(ev) {
    ev.preventDefault();
    if (this.state.gestureOrigin) {
      const diffX = (this.state.gestureOrigin.x - ev.clientX);
      const diffY = (this.state.gestureOrigin.y - ev.clientY);
      const selected = this.state.nodes.filter(n => {
        if (n.selected) {
          n.location.x = n.location.x - diffX;
          n.location.y = n.location.y - diffY;
        }
        return n.selected;
      });
      if (selected.length === 0) {
        const offsetX = this.state.offset.x + diffX;
        const offsetY = this.state.offset.y + diffY;
        this.setState({
          gestureOrigin: {
            x: parseInt(ev.clientX, 10),
            y: parseInt(ev.clientY, 10)
          },
          offset: {
            x: offsetX,
            y: offsetY
          }
        });
      } else {
        this.setState({
          gestureOrigin: {
            x: parseInt(ev.clientX, 10),
            y: parseInt(ev.clientY, 10)
          },
          nodes: this.state.nodes
        });
      }
    }
  }

  mouseUp(ev) {
    ev.preventDefault();
    this.state.nodes.filter(n => n.selected).forEach(n => {
      n.selected = false;
    });
    this.setState({
      gestureOrigin: null,
      nodes: this.state.nodes
    });
  }
});
