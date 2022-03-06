# @miqro/web-components

very basic and ***experimental*** ```HTMLElements``` for creating dynamic components with a **basic template** language influenced by ***React***.

## Component class

the ```Component``` class extends from ```HTMLElement``` and it is the base for creating custom HTMLElements.

```typescript
customElements.define("my-element", class extends Component {
  click(ev) {
    ev.preventDefault();
    this.setState({
      clickCount: this.state.clickCount ? this.state.clickCount + 1 : 1
    });
    this.emit("user-click-me");
  }

  render() {
    return `<div><a href="#" data-on-click="{click}">click me</a><p>{state.clickCount}</p></div>`
  }
})
```

### ***Important Notice***

when rendering a template the string, number, boolean values are html encoded to ***sanitize*** user input.

for example the inner p in ```this.text``` in the code bellow will not render as html, instead it will be html **encoded**.

```typescript
customElements.define("my-custom", class extends Component {
    render() {
        this.text = "<p>this p will not be rendered as html beacuse it is encoded.</p>";
        return `<p>{text}</p>`
        // this will render the inner p as HTML without enconding
        // return "<p>" + this.text + "</p>";
    }
})
```

### Events

the ```Component``` class can auto attach ```addEventListener(...)``` to a function of the instance using the template
system.

#### listen to standard and custom events

use ```data-on-...``` attribute to automatically call ```addEventListener(...)``` on the element.

```typescript
customElements.define("my-app", class extends Component {
  // event handler
  userClick() {
    console.log("app got custom event");
  }

  render() {
    // attach event handler using data-on-user-click-me={userClick}
    return `<my-component data-on-user-click-me={userClick}></my-component>`;
  }
});

customElements.define("my-component", class extends Component {
  // event handler
  click() {
    this.setState({
      clickCount: this.state.clickCount ? this.state.clickCount + 1 : 1
    });
    this.emit("user-click-me");
  }

  render() {
    // using using data-on-click={click} to call attach to "click" event
    return `<div><a href="#" data-on-click="{click}">click me</a><p>{state.clickCount}</p></div>`
  }
});
```

#### emit events

when ```this.emit(eventName)``` is called it will invoke internally ```this.dispatchEvent(event)``` where ```event``` by
default be a cached instance of ```new Event("myEvent", {composed: true, bubbles: false, cancelable: false })```. to
change this behavior call ```this.registerEvent("myEvent", ...EventInit Options...)```.

##### define the EventInit arguments (optional)

when ```this.emit(eventName)``` is called and ```eventName``` is not defined a new ```Event``` will be created with the
default options.

```typescript
customElements.define("my-element", class extends Component {
  constructor() {
    super();
    this.registerEvent("myEvent", {
      ... // EventInit Arguments as new Event("myEvent", ...)
    });
  }

  click() {
    this.emit("myEvent");
  }

  render() {
    return "<p><b data-on-click={click}>{props.text}</b></p>"
  }
})
```

### Lifecycle

the ```Component``` class extends ```HTMLElement``` and implements the ```connectedCallback()```. It uses this
callback to render the template.

#### ***Important Notice***

when overriding the standard WebComponent callbacks like ```connectedCallback``` remember to call ```super.connectedCallback()```
to maintain the ```Component's``` normal lifecycle.

example

```typescript
class MyComponent extends Component {
  connectedCallback() {
    // do my stuff before render and this.props population
    // remember to call super to not alter the Component's lifecyle
    super.connectedCallback();
    // do my stuff after render and this.props population
  }
}
```

#### this.render()

the result of ```this.render()``` is used to replace ```this.innerHtml```. this will call for complete **re-render** of
the element by the browser.

by default ```this.render()``` will be called when it's connected to
the dom and also when ```this.setState({..})``` is invoked.

to change this behavior simply override the method ```this.didUpdate(prevState)``` and return ```false```
when needed.

Also, if ```this.render()``` returns ```undefined``` ```this.innerHtml``` will not be changed, avoiding a complete
re-render of all child elements.

#### this.didUpdate(prevState)

this callback is called when ```this.state``` of the component changes.

can be overridden to stop the component render by returning false. by default, it returns true for all changes.

Consider implementing ```this.didUpdate(prevState)``` to avoid unnecessary re-renders.

## Router class

the ```Router``` class extends from ```Component``` and watches changes on the ```popstate``` event on window. If the
change matches a ```Route``` child element it will render that element.

```typescript
customElements.define("my-404", class extends Component {
  render() {
    return "not found";
  }
});
customElements.define("my-home", class extends Component {
  render() {
    return "home";
  }
});
customElements.define("my-about", class extends Component {
  render() {
    return "about";
  }
});
customElements.define("my-app", class extends Router {
  constructor() {
    super();
    this.state = {
      routes: [
        {path: "/", element: "my-home"},
        {path: "/about", element: "my-about"},
      ],
      defaultElement: "my-404"
    }
  }
});
```

### Change path without reloading.

the ```Router``` class attaches a listener on ```popstate``` event to listen to url changes.

to change the path without reloading the page use the standard ```window.history.pushState(null, null as any, path);```
or the helper ```historyPushPath(path)``` to trigger programmatically without user interaction.

```typescript
window.history.pushState(null, null as any, "/about");
// if you do it programmatically emit the popstate event
// window.dispatchEvent(new PopStateEvent("popstate"));
```

or use the helper

```typescript
historyPushPath("/about");
```

### base path

setting the attribute ```data-router-base-path``` to the HTML element to allow the router to be nested.

```html
<html data-router-base-path="/public/front">
....
</html>
```

this will affect ```RouteLink``` elements also.

### RouteLink

you can also use the helper ```RouteLink``` to provide clickable elements to change the current route without reloading. The benefit of using ```RouteLink``` is that it takes into account the **base path**.  

```typescript
customElements.define("my-link", RouteLink);
```

```html
<my-link data-path="/about">go to about page</my-link>
```

## Importing

this module is exported as a ```CommonJS``` and ```ESM``` module also, a minified ```bundle``` is provided.

when using a packer like webpack just import the module and the packer will take care of the rest like.

```typescript
import {Component, Router, RouteLink, historyPushPath} from "@miqro/web-components";
```

or

```typescript
const {Component, Router, RouteLink, historyPushPath} = require("@miqro/web-components");
```

### using the ESM module

the esm version of the module is located in ```dist/esm```.

### using bundle directly with script tag

you can also add the bundle located in ```dist/webcomponents.bundle.min.js``` in the html.

this method will add the global ```WebComponents``` that will house the module, so accessing for example the ```Component``` class you will have to use ```WebComponents.Component```.

```html
<html>
<head>
  <!-- this will add the WebComponents global with the module -->
  <script src="webcomponents.bundle.min.js"></script>
</head>
<body>
<my-element></my-element>
<script>
  // the WebComponents global contains the @miqro/webcomponents module.
  const {Component} = WebComponents;
  
  customElements.define("my-element", class extends Component {
      render() {
          return `<p>{props.text}</p>`
      }
  });
</script>
</body>
</html>
```

## Integrating with standard WebComponents API

the ```Component``` class is just a standard WebComponent element, it extends ```HTMLElement``` so integrating it into
standard WebComponent projects is straight forward.

```typescript
// Standard WebComponent
customElements.define("my-app", class extends HTMLElement {
  constructor() {
    super();
    const myHome = new document.createElement("my-home");
    // myHome this.props will be re-populated and the component re-render
    myHome.setAttribute("name", "no-name");
    setTimeout(() => {
      // myHome this.props will be re-populated and the component re-render  
      myHome.setAttribute("name", "some-name");
    }, 1000);
    // listen to custom event from standard HTMLElement
    myHome.addEventListener("myEvent", () => {

    });
    this.appendChild(myHome);
  }
});

// Custom "Component"
customElements.define("my-home", class extends Component {

  click() {
    this.emit("myEvent");
  }

  render() {
    return `<p data-on-click="{click}">{props.name}</p>`;
  }
});
```
