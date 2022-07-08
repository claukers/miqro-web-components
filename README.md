# @miqro/web-components

very basic and ***experimental*** ```HTMLElements``` for creating dynamic components with a **very basic template**
system. heavily influenced by ReactJS Hooks.

## define(name, func, [options])

### ***func*** the render function.

```typescript
type RenderFunction =
  () =>
    Promise<{ template?: string; values?: any } | string | undefined> |
    { template?: string; values?: any } | string | undefined
```

### ***options*** [optional] object parameter.

```typescript
interface Options {
  shadowInit?: ShadowRootInit | boolean; // defaults to { mode: "closed" }
  template?: string; // defaults to ""
}
```

example

```typescript
define("my-element", function () {
  return "<p>Hello World!</p>";
});
```

### RenderFunctionThis

#### this.useAs

set a template value for the current render.

```typescript
define("my-element", function () {
  this.useAs("text", "Hello World!");
  return "<p>{text}</p>";
});
```

#### this.useState

create a state variable that you can alter using the set function. Calling the set function will re-render the
component.

```typescript
define("my-element", function () {
  const defaultValue = "defaultValue";
  const [value, setValue] = this.useState(defaultValue);
  setTimeout(() => {
    setValue("newValue");
  }, 1000);
});
```

#### this.useQuery

watch location.query changes on the custom element. Calling the set function will re-render the component and set
location.query.

```typescript
define("my-element", function () {
  const [offset, setOffset] = this.useQuery("offset", 0);
});
```

#### this.useAttribute

watch attribute changes on the custom element.

```typescript
define("my-element", function () {
  const value = this.useAttribute("data-name", defaultValue);
});
```

#### this.useJSONAttribute

watch attribute changes on the custom element and return a parsed json from the value.

```typescript
define("my-element", function () {
  const value = this.useJSONAttribute("data-name", {});
});
```

consider using ```this.useSubscription``` to transfer objects instead.

#### this.useSubscription

helpers to listen a store subscription.

```typescript
define("my-element", function () {
  this.useAs("dataName", this.useSubscription(store, s => s.data.name));
});
```

#### this.useEffect

hook a function to run after render and before re-render and disconnect.

```typescript
define("my-element", function () {
  this.useEffect(() => {
    return () => {
    };
  });
});
```

#### this.useMountEffect

hook a function to run after first render and before disconnect.

```typescript
define("my-element", function () {
  this.useMountEffect(() => {
    function listener() {
    }

    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("popstate", listener);
    };
  });
});
```

## single file component

**my-element.sfc**

```html

<my-element data-shadow-roow-mode="closed">
  <template>
    <p>Hello {name}!</p>
  </template>
  <script type="module">
    export default function () {
      this.useAs("name", "World");
    }
  </script>
</my-element>
```

**npx miqro sfc inputDir/ outputDir/**

this will produce

**my-element-component.js**

```typescript
export default function () {
  this.useAs("name", "World");
}
```

**my-element.js**

```typescript
import {define} from "@miqro/web-components";
import render from "./index-component.js";

define("my-component", render, {
  shadowInit: {
      mode: "closed"
  },
  template: "<p>{text}</p>"
});
```

to use this element just import ```my-element.js```

## template

### built-in template engine

to avoid flickering the re-renders of a component try to re-use the HTMLElements created in the previous renders.
for this an algorithm similar to the [Reconciliation algorithm](https://reactjs.org/docs/reconciliation.html) from
ReactJS is used.

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

##### cache templates on build

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

### use other template engine

just use the custom engine to return an xml that implements the built-in template engine.

for example with pug

```typescript
const pug = require('pug');
const fn = pug.compile('p. {name}', options);

define("my-tag", function () {
  this.useAs("name", "Hello World!");
  return fn({
    ...
  });
})
```

## debugging

to enable the internal logging for debugging run this at the earliest on your program.

```typescript
setLogLevel("debug");
//setLogLevel("trace");
```

## Importing

```npm install @miqro/web-components --save```

this module is exported as a ```CommonJS```.

when using a tool like webpack just import the module and the packer will take care of the rest like.

you can also import the ***esm*** version located on ```dist/esm/index.js``` and a esm bundle
on ```dist/esm.bundle.js```. No minified version is provided. 
