# @miqro/web-components

helpers for creating dynamic HTMLElements with a basic templates

# Component class

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

## Component lifecycle

the ```Component``` class extends ```HTMLElement``` and implements the ```connectedCallback()``` and ```disconnectedCallback()```, it also creates a ```MutationObserver``` to watch all attribute changes. It uses this callbacks to populate ```this.props``` and ```this.state``` and call ```this.render``` to render the template when necessary, the standard ```attributeChangedCallback``` it is not used to watch attributes. 

### this.willMount()

this callback is called when the standard **connectedCallback** is called and ***before*** the render lifecycle.

### this.didMount()

this callback is called when the standard **connectedCallback** is called and ***after*** the render lifecycle.

### this.didUnMount()

this callback is called when the standard **disconnectedCallback** is called and ***after*** the local observer is diconnected.

### this.didUpdate(prevProps, prevState)

this callback is called when the ```props``` or ```state``` of the component changes. 

can be overridden to stop the component render by returing false. by default it returns true for all changes.

Consider implementing ```this.didUpdate(prevProps, prevState)``` to avoid unnecessary re-renders.

### this.render()

the result of ```this.render()``` is used to replace ```this.innerHtml```. this will call for complete **re-render** of
the element by the browser.

by default ```this.render()``` will be called if one of the component's attributes changes and when it's connected to
the dom, also ```this.render()``` will be called when ```this.setState({..})``` is invoked.

to change this behavior simply override the method ```this.didUpdate(prevProps, prevState)``` and return ```false```
when needed.

Also, if ```this.render()``` returns ```undefined``` ```this.innerHtml``` will not be changed, avoiding a complete
re-render of all child elements.

### **Important Notice**

when overriding the standard WebComponent callbacks like ```connectedCallback``` remember to call ```super.callback()``` to not alter the ```Component's``` lifecycle.

example

```typescript
import {Component} from "@miqro/web-components";

class MyComponent extends Component {
    connectedCallback() {
        // remember to call super to not alter the Component's lifecyle
        super.connectedCallback(); 
    }
}
```

## this.setState(...arg...)

```this.setState(arg: Partial<State>)```

will alter ```this.state``` with ``arg`` and will call ```didUpdate(prevProps, prevState)``` and ``this.render()`` if ```didUpdate(prevProps, prevState)``` returned true.

## disable attr watching

all attribute watching is **independent** of the standard way of watching attribute changes in WebComponents using ```attributeChangedCallback(...)```.

by default all attr changes to the HTMLElement are observed with a ```MutationObserver``` to disable call disconnect on ```constructor``` and ```willMount```. 

```typescript
import {Component} from "@miqro/web-components";

customElements.define("my-element", class extends Component {
  constructor() {
    super();
    this._observer.disconnect();
    /*
    // reconect the ones to want
    // render will be called by this observer
    // see MutationObserver on mdm for more information
    this._observer.observe(this, {
      attributes: ...,
      ...
    });
     */
  }
  
  willMount() {
    this._observer.disconnect();
    /*
    // reconect the ones to want
    // render will be called by this observer
    // see MutationObserver on mdm for more information
    this._observer.observe(this, {
      attributes: ...,
      ...
    });
     */
  }

  render() {
    return "<p>{props.text}</p>"
  }
})
```

# Events

## listen to standard and custom events

use ```data-on-...``` attribute to automatically call ```addEventListener(...)``` on the element.

````html

<html>
<body>
<app></app>
<script type="module">
  import {Component} from "@miqro/web-components";

  customElements.define("app", class extends Component {
    userClick() {
      console.log("app got custom event");
    }

    render() {
      return `<my-component data-on-user-click-me={userClick}></my-component>`;
    }
  });

  customElements.define("my-component", class extends Component {
    click() {
      this.setState({
        clickCount: this.state.clickCount ? this.state.clickCount + 1 : 1
      });
      this.emit("user-click-me");
    }

    render() {
      return `<div><a href="#" data-on-click="{click}">click me</a><p>{state.clickCount}</p></div>`
    }
  });
</script>
</body>
</html>
````

## emit events

when ```this.emit(eventName)``` is called it will invoke internally ```this.dispatchEvent(event)``` where ```event``` by
default be a cached instance of ```new Event("myEvent", {composed: true, bubbles: false, cancelable: false })```. to
change this behavior call ```this.registerEvent("myEvent", ...EventInit Options...)```.

### define the EventInit arguments (optional)

when ```this.emit(eventName)``` is called and ```eventName``` is not defined a new ```Event``` will be created with the
default options.

```typescript
import {Component} from "@miqro/web-components";

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

# Router

the ```Router``` class extends from ```Component``` and watches changes on the ```popstate``` event on window. If the change matches a ```Route``` child element it will render that element. 

```html

<html>
<body>
<path-router data-default-element="my-404">
  <path-route data-path="/" data-element="my-home"></path-route>
  <path-route data-path="/about" data-element="my-about"></path-route>
</path-router>
<script type="module">
  import {Router, Route, Component} from "@miqro/web-components";

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
  customElements.define("path-router", Router);
  customElements.define("path-route", Route);
</script>
</body>
</html>
```

## history.pushState

the ```Router``` class attaches a listener on ```popstate``` event to listen to url changes.

to change the path without reloading the page use the standard ```window.history.pushState(null, null as any, path);``` or the helper ```historyPushPath(path)``` to trigger programmatically.

```typescript
window.history.pushState(null, null as any, "/about");
// if you do it programmatically emit the popstate event
// window.dispatchEvent(new PopStateEvent("popstate"));
```

or use the helper

```typescript
import {historyPushPath} from "@miqro/web-components";

historyPushPath("/about");
```

# Integrating with standard WebComponents API

the ```Component``` class is just a standard WebComponent element, it extends ```HTMLElement``` so integrating
it into standard WebComponent projects is straight forward.

```html

<html>
<body>
<my-app></my-app>
<script type="module">

  import {Component} from "@miqro/web-components";

  // Standard WebComponent
  customElements.define("my-app", class extends HTMLElement {
    constructor() {
      super();
      const myHome = new document.createElement("my-home");
      myHome.setAttribute("name", "no-name");
      setTimeout(() => {
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
</script>
</body>
</html>
```
