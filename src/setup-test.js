const {resolve} = require("path");

globalThis.HTMLElement = class {

}

globalThis.window = {

}

module.exports.distPath = resolve(__dirname, "..", "dist");
