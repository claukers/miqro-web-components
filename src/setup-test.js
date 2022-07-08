const {resolve} = require("path");

globalThis.HTMLElement = class {

}

globalThis.MutationObserver = class {

}

globalThis.DOMParser = class {

}

globalThis.ShadowRoot = class {

}

globalThis.window = {}

module.exports.distPath = resolve(__dirname, "..", "dist", "cjs");
