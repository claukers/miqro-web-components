const {Component, Router, Route, RouteLink, historyPushPath} = require("../../../../../dist/cjs/index.js");

window.onload = () => {

  customElements.define("my-404", class NotFound extends Component {
    render() {
      return `<p>not found</p><route-link data-path="/"><a href="#">home link</a></route-link>`;
    }
  });

  customElements.define("my-home", class Home extends Component {
    render() {
      return `home`;
    }
  });

  customElements.define("path-route", Route);
  customElements.define("route-link", RouteLink);
  customElements.define("path-router", Router);
}
