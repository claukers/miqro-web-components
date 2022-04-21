# @miqro/web-components

very basic and ***experimental*** ```HTMLElements``` for creating dynamic components with a **very basic template**
language.

## Component class

the ```Component``` class extends from ```HTMLElement```.

```typescript
// script.js
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
// component with inline template
customElements.define("my-custom", class extends Component {
  render() {
    return `<p>{this.dataset.text}</p>`;
  }
})
```

```html
<!--my-element.html-->
<div>
  <my-custom data-text="clicked {this.state.clickCount}"/>
  <a href="#" data-on-click="{this.click}">click me</a>
</div>
```

### Lifecycle

the ```Component``` class extends ```HTMLElement``` so has the same lifecycle as a standard WebComponent. The class
implements the ```connectedCallback``` to render the template.

- ```this.connectedCallback()``` ```->``` ```this.refresh()```
- ```this.setState(partialState)``` ```->``` ```this.didUpdate(prevState)``` ```->``` ```this.refresh()```

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

#### this.refresh(): void

calling ```this.refresh()``` will render the component's template to ```this.innerHtml```.

```this.refresh()``` will be called on the standard connectedCallback and when ```this.setState(...)``` is called.

It will use as template ```Class.template``` static attribute or the result of ```this.render()``` as template to
render.

#### this.didUpdate(prevState): boolean

this callback is called when ```this.setState(...)``` function is invoked.

can be overridden to stop the call to ```this.render()``` by returning ```false```. by default, it returns ```true```.

***Consider implementing ```this.didUpdate(prevState)``` to avoid unnecessary re-renders.***

example

```typescript
customElements.define(class extends Component {
  didUpdate(prevState) {
    return prevState.text !== this.state.text;
  }

  render() {
    return "<p>{this.state.text}</p>";
  }
})
```

## Template

### data-if

to avoid rendering elements use ```data-if```.

***the value must be a boolean.***

```html
<p data-if="{this.state.showDiv}"></p>
```

### data-for-each

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

### data-state

set the initial state of a custom component and to transfer objects though attributes without serialization.

***the value must be an object.***

for example this will call ```this.setState(...)``` on ```custom-element``` before it is connected to the dom.

```xml
<!--data-state example-->
<custom-element data-state="{this.state.divData}"/>
```

### data-ref

get the actual ```HTMLElement``` reference of an element rendered.

for example this will call ```this.setDivRef``` with the p's ```HTMLElement``` reference.

```html
<p data-ref="{this.setDivRef}"></p>
```

### data-on

to listen to the element's events.

for example this will call ```addEventListener``` on ```click``` event.

```html
<p data-on-click="{this.divClicked}"></p>
```

### include

to include other templates into the current one use a comment like this.

```html
<!--{common/other-template.html}-->
```

this will fetch ```common/other-template.html``` if not already in the cache.

to preload templates use the ```setCache``` function with an object and the templates.

```typescript
setCache({
  "common/other-template.html": "<p>{this.state.text}</p>"
});
```

***```setCache``` will throw if called more than once.***

consider auto generating a ```cache.json``` file with

```npx miqro webcomponents:generate:cache src/ dist/cache.json```

## Separating template from the Component class

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
