const {Component, Router, RouteLink, ShadowRootComponent} = require("../../../../../dist/cjs/index.js");
const {request} = require("@miqro/request");

customElements.define("my-404", class extends Component {
  render() {
    return `<p>not found</p><route-link data-path="/"><a href="#">home link</a></route-link>`;
  }
});

customElements.define("my-home", class extends Component {
  async click() {
    try {
      const response = await request({
        url: "/api/v1/feeds?other=otherValue1",
        query: {
          some: 1,
          another: ["1", "2"],
          other: "otherValue"
        }
      });
      this.setState({
        response,
        data: JSON.stringify(response.data, undefined, 4),
      });
    } catch (e) {
      console.error("error on request call");
      console.error(e);
    }
  }

  render() {
    return `home <button data-on-click="{click}">click me</button> <p>{state.data}</p><p>{state.response.data}</p>`;
  }
});

customElements.define("route-link", RouteLink);

customElements.define("my-router", class extends Router {
  constructor() {
    super();
    this.state = {
      defaultElement: "my-404",
      routes: [
        {path: "/", element: "my-home"},
        {path: "/about", element: "my-about"}
      ]
    };
  }
});

customElements.define("my-app", class extends ShadowRootComponent {
  render() {
    return "<my-router></my-router>";
  }
});

