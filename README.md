# @miqro/web-components

very basic and ***experimental*** ```HTMLElements``` for creating dynamic components with a **pluggable** template and
a **very basic template**
language included.

## Component class

the ```Component``` class extends from ```HTMLElement``` so behaves as a standard web component.

```typescript
// my-element.js
import {Component} from "@miqro/web-components";

// component external template
customElements.define("my-element", class extends Component {
  static template = "my-element.html";

  click(ev) {
    ev.preventDefault();
    this.setState({
      clickCount: this.state.clickCount ? this.state.clickCount + 1 : 1
    });
  }
});
```

```html
<!--my-element.html-->
<div>
  <a href="#" data-on-click="{this.click}">click me</a>
  <p>{this.dataset.text}</p>
</div>
```

## Lifecycle

the ```Component``` class extends ```HTMLElement``` so has the same lifecycle as a standard WebComponent. The class
implements the ```connectedCallback``` to render the template.

- ```this.connectedCallback()``` ```->``` ```render template```
- ```this.setState(partialState)``` ```->``` ```this.didUpdate(prevState)``` ```->``` ```render template```

***Important Notice***

when overriding the standard WebComponent callbacks like ```connectedCallback``` remember to
call ```super.connectedCallback()```
to maintain the ```Component's``` normal lifecycle.

example

```typescript
class MyComponent extends Component {
  connectedCallback() {
    // do my stuff before this.render
    // remember to call super to not alter the Component's lifecyle
    super.connectedCallback();
    // do my stuff after this.render is called
  }
}
```

#### this.didUpdate(prevState): boolean

this callback is called when ```this.setState(...)``` function is invoked.

can be overridden to stop the call to ```this.render()``` by returning ```false```. by default, it returns ```true```.

***Consider implementing ```this.didUpdate(prevState)``` to avoid unnecessary re-renders.***

example

```typescript
customElements.define("custom-element", class extends Component {
  didUpdate(prevState) {
    return prevState.text !== this.state.text;
  }

  render() {
    return "<p>{this.state.text}</p>";
  }
})
```

## without templates

if static attribute ```Component.template``` isn't defined and ```component.render``` returns undefined no template is
rendered.

for example

```typescript
customElements.define("my-custom", class extends Component {
  constructor() {
    super();
    this.state = {
      clickCount: 0
    };
    const containerDiv = new HTMLDivElement();
    containerDiv.classList.add("container");
    this.p = new HTMLParagraphElement();
    const button = new HTMLButtonElement();
    button.textContent = "click me";
    button.addEventListener("click", (ev) => {
      ev.preventDefault();
      this.setState({
        clickCount: this.state.clickCount + 1
      });
    });
    containerDiv.appendChild(p);
    containerDiv.appendChild(button);
  }

  // render is used instead of connectedCallback to listen to state changes
  render() {
    this.p.textContent = "clicked " + this.state.clickCount;
  }
});
```

## Template

### Using external Template Engine

to use an external template engine just return the html output of the template engine in the ```render()``` method.

for example using pug

```npm install pug --save```

```typescript
import {render as pugRender} from "pug";

customElements.define("my-element", class extends Component {
  render() {
    return pugRender("p #{dataset.name}", this);
  }
})
```

this will pass the ```pug``` **html output** to the **built-in** template.

to avoid using the **built-in** template return **undefined**, this will render the built-in template attributes
like ```data-ref``` ineffective.

```typescript
import {render as pugRender} from "pug";

const pugTemplate = "p #{dataset.name}";

customElements.define("my-element", class extends Component {
  render() {
    pugRender(this);
    return;
  }
})
```

### Built-in Template

to use the build-in template system just return the html in the ```render()``` method.

all renders are compared to the old render output and apply the difference similar to
the [Reconciliation algorithm](https://reactjs.org/docs/reconciliation.html) from ReactJS to avoid re-creating the same HTMLElements.

#### inline template example

```typescript
customElements.define("my-element", class extends Component {
  render() {
    return "<p>{this.dataset.someAttribute}</p> \
      <p>{this.state.someStateValue}</p> \
      <div>{children}</div>";
  }
})
```

#### external template file

define the static attribute ```template``` to your component's class.

```typescript
customElements.define("my-element", class extends Component {
  static template = "somepath/template.html";
})
```

```html
<!--somepath/template.html-->
<p>{this.dataset.someAttribute}</p>
<p>{this.state.someStateValue}</p>
<div>{children}</div>
```

#### data-if

to avoid rendering elements use ```data-if```.

***the value must be a boolean.***

```html
<p data-if="{this.state.showDiv}"></p>
```

#### data-for-each

to loop list. the value for ```data-for-each``` must be an Array or a function that returns an Array.

***the value must be an Array.***

```html
<!--data-for-each example-->
<ul>
  <li data-for-each="{this.state.list}">
    {item.name}
  </li>
</ul>
```

to change ```item``` for another string set the ```data-for-each-item``` attribute.

#### data-state

set the initial state of a custom component and to transfer objects though attributes without serialization.

***the value must be an object.***

for example this will call ```this.setState(...)``` on ```custom-element``` before it is connected to the dom.

```xml
<!--data-state example-->
<custom-element data-state="{this.state.divData}"/>
```

#### data-ref

get the actual ```HTMLElement``` reference of an element rendered.

for example this will call ```this.setDivRef``` with the p's ```HTMLElement``` reference.

```html
<p data-ref="{this.setDivRef}"></p>
```

#### data-on

to listen to the element's events.

for example this will call ```addEventListener``` on ```click``` event.

```html
<p data-on-click="{this.divClicked}"></p>
```

or a custom event

```html
<p data-on-custom-event="{this.customEventListener}"></p>
```

#### include

to include other templates into the current one use a comment like this.

```html
<!--{common/other-template.html}-->
```

this will get the template in url ```common/other-template.html``` using fetch.

#### Inline templates

```typescript
customElements.define("my-tag", class extends Component {
  render() {
    return "<p>{this.dataset.name}</p>"
  }
});
```

#### [EXPERIMENTAL] Separating template from the Component class

```components/my-tag.html```

```html
<p>template</p>
```

```components/my-tag.ts```

```typescript
customElements.define("my-tag", class extends Component {
  static template = "components/my-tag.html";
});
```

or use include comment

```typescript
customElements.define("my-tag", class extends Component {
  render() {
    return `<!--{components/my-tag.html}--->`
  }
});
```

##### bundle templates

to preload templates use the ```setCache``` function with an object and the templates.

```typescript
setCache({
  "common/other-template.html": "<p>{this.state.text}</p>"
});
```

***```setCache``` will throw if called more than once.***

consider auto generating a ```cache.json``` file with

```npx miqro webcomponents:generate:cache src/ dist/cache.json```

and then in your ```index``` file add the corresponding "require" so when you bundle or minify your app the templates
will be included.

```typescript
setCache(require("./cache.json"));
```

## watching attribute changes

to watch for attribute changes use the standard ```attributeChangedCallback``` from the HTMLElement class to watch for
attribute changes.

to re-render the component's template call ```this.refresh()```.

```typescript
customElements.define("my-app", class extends Component {
  static get observedAttributes() {
    return ['data-name'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.refresh(); // this will re-render the component's template
  }

  render() {
    return "<p>{this.dataset.name}</p>"
  }
});
```

## Importing

this module is exported as a ```CommonJS```.

when using a packer like webpack just import the module and the packer will take care of the rest like.

```typescript
import {Component, Router, RouteLink, historyPushPath} from "@miqro/web-components";
```

or

```javascript
const {Component, Router, RouteLink, historyPushPath} = require("@miqro/web-components");
```
