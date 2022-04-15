const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "template", "nodes", "text.js");

const testOptions = {
  category: "template.nodes.text unit tests"
};

it("happy path", async () => {

}, testOptions);
