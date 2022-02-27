const {Component, Router, Route, RouteLink, historyPushPath} = require("../../../../../dist/cjs/index.js");
const {request} = require("@miqro/request");

customElements.define("my-404", class NotFound extends Component {
  render() {
    return `<p>not found</p><route-link data-path="/"><a href="#">home link</a></route-link>`;
  }
});

customElements.define("my-home", class Home extends Component {
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
      console.dir(response.data);
    } catch (e) {
      console.error("error on request call");
      console.error(e);
    }
  }

  render() {
    return `home <p data-on-click="{click}">click me</p>`;
  }
});

customElements.define("path-route", Route);
customElements.define("route-link", RouteLink);
customElements.define("path-router", Router);

