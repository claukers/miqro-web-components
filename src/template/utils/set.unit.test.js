const {fake, requireMock, describe, it} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "template", "utils", "set.js");

describe("template.util.set unit tests", () => {
  it("happy path nested with {}", async () => {
    const {set} = requireMock(testFilePath, {}, distPath);
    const obj ={};
    const ret = set(obj, "user.name", "somename");
    strictEqual(ret, obj);
    strictEqual(obj.user.name, "somename");
  });
});
