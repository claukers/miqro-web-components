import {useState, define} from "./utils.js";
import {defineFunction} from "./lib/index.js";

define("label-component", function label() {
  const text = useState("text");
  const count = useState(0);
  return {
    template: `<p data-on-click="{click}">{text}</p>`,
    values: {
      count: count.value,
      text: text.value,
      click: () => {
        count.value = count.value + 1;
        text.value = `clicked ${count.value}`;
      }
    }
  };
});

defineFunction("label-fn", function (component) {
  const [count, setCount] = component.useState(0);

  return {
    template: `<p data-on-click="{click}">{count}</p>`,
    values: {
      count,
      click: () => {
        setCount(count + 1);
      }
    }
  }
})
