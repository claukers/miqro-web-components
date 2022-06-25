require("./lib").defineFunction("my-component", async function() {
this.useAs("text", "helloWorld");
}, undefined, "<p >{text}</p>")