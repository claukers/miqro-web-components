# @miqro/web-components

very basic and ***experimental*** ```HTMLElements``` for creating dynamic components with a **very basic template**
language influenced by ***React***.

## Component class

the ```Component``` class extends from ```HTMLElement``` and it is the base for creating custom HTMLElements.

```script.js```

```typescript
// component with inline template
customElements.define("my-element", class extends Component {
  click(ev) {
    ev.preventDefault();
    this.setState({
      clickCount: this.state.clickCount ? this.state.clickCount + 1 : 1
    });
    this.dispatchEvent(new CustomEvent("user-click-me"));
  }
  
  render() {
    return `<div><my-custom/><a href="#" data-on-click="{this.click}">click me</a><p>{this.state.clickCount}</p></div>`
  }
});

// component external template
customElements.define("my-custom", class extends Component {
  static template = "template.html";
})
```

```template.html```

```html
<p>{this.text}</p>
```

### Template

```html

<div>
  hello {this.state.name}
</div>
```

#### data-if

to avoid rendering elements use ```data-if```.

***the value must be a boolean.***

```html

<div data-if="{this.state.showDiv}"></div>
```

#### data-for-each

to loop list. the value for ```data-for-each``` must be an Array or a function that returns an Array.

***the value must be an Array.***

```html

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

```html

<custom-element data-data="{this.state.divData}"></custom-element>
```

#### data-ref

get the actual ```HTMLElement``` reference of an element rendered.

for example this will call ```this.setDivRef``` with the div's ```HTMLElement``` reference.

```html

<div data-ref="{this.setDivRef}"></div>
```

#### data-on

to listen to the element's events.

for example this will call ```addEventListener``` on ```click``` event.

```html

<div data-on-click="{this.divClicked}"></div>
```

#### include other templates

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

consider auto generating a ```cache.json``` file with

```npx miqro webcomponents:generate:cache src/ dist/cache.json```

#### Separating template from the Component class

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

or

```typescript
customElements.define("my-tag", class extends Component {
  render() {
    return `<!--{components/my-tag.html}--->`
  }
});
```

### Lifecycle

the ```Component``` class extends ```HTMLElement``` so has the same lifecycle as a standard WebComponent, also
implements the ```connectedCallback()```. It uses this callback to render the template.

#### ***Important Notice***

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

### this.didUpdate(prevState): boolean

this callback is called when ```this.setState(...)``` function is invoked.

can be overridden to stop the call to ```this.render()``` by returning false. by default, it returns true for all
changes.

**Consider implementing ```this.didUpdate(prevState)``` to avoid unnecessary re-renders.**

### this.render(): string | void

the result of ```this.render()``` is used to replace ```this.innerHtml```. this will call for complete **re-render** of
the element by the browser.

by default ```this.render()``` will be called when it's connected to the dom and also when ```this.setState({..})``` is
invoked.

to change this behavior simply override the method ```this.didUpdate(prevState)``` and return ```false```
when needed.

Also, if ```this.render()``` returns ```undefined``` ```this.innerHtml``` will not be changed, avoiding a complete
re-render of all child elements.

## Importing

this module is exported as a ```CommonJS``` module and a minified ```bundle```.

when using a packer like webpack just import the module and the packer will take care of the rest like.

```typescript
import {Component, Router, RouteLink, historyPushPath} from "@miqro/web-components";
```

or

```typescript
const {Component, Router, RouteLink, historyPushPath} = require("@miqro/web-components");
```

### using bundle directly with script tag

you can also use the bundle located in ```dist/webcomponents.bundle.min.js```.

using the bundle will add the global ```WebComponents``` that will house the module, so accessing for example
the ```Component``` class you will have to use ```WebComponents.Component```.

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
