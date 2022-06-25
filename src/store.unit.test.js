const {fake, requireMock, describe, it} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("./setup-test.js");

const testFilePath = resolve(distPath, "cjs", "store.js");

describe("store unit tests", () => {

  setTestTimeout(10000);

  it("deepEquals happy path 1,2", async () => {
    const {deepEquals} = requireMock(testFilePath, {}, distPath);
    strictEqual(deepEquals([1, 2], [1, 2]), true);
    strictEqual(deepEquals([1, 2], [1, 2, 3, 4].slice(0, 2)), true);
    strictEqual(deepEquals(1, 2), false);
    strictEqual(deepEquals("url1", "url2"), false);

    const A = [{}]
  });

  it("deepEquals happy path array", async () => {
    const {deepEquals} = requireMock(testFilePath, {}, distPath);
    strictEqual(deepEquals([1, 2], [1, 2]), true);
    strictEqual(deepEquals([1, 2], [1, 2, 3, 4].slice(0, 2)), true);
    strictEqual(deepEquals([1, 2], [1, 2, 3, 4].slice(1, 3)), false);

    const A = [{}]
  });

  it("deepEquals happy array of objects", async () => {
    const {deepEquals} = requireMock(testFilePath, {}, distPath);

    const result = deepEquals([{
      A: 2
    }, {
      B: 1
    }], [{
      A: 2
    }, {
      B: 1
    }]);

    strictEqual(result, true);
  });

  it("deepEquals happy null/undefined", async () => {
    const {deepEquals} = requireMock(testFilePath, {}, distPath);

    strictEqual(deepEquals(undefined, null), false);
    strictEqual(deepEquals(null, undefined), false);
    strictEqual(deepEquals(null, null), true);
    strictEqual(deepEquals(undefined, undefined), true);
  });

  it("deepEquals happy object", async () => {
    const {deepEquals} = requireMock(testFilePath, {}, distPath);

    class A {
      constructor(a) {
        this.A = a;
      }
    }

    const result = deepEquals({
      A: 2
    }, new A(2));

    strictEqual(result, false);

    strictEqual(deepEquals({
      A: 2
    }, {
      A: 2
    }), true);

    const same = {
      A: 2
    };
    strictEqual(deepEquals(same, same), true);

    strictEqual(deepEquals({
      A: 2
    }, {
      A: 2,
      B: 0
    }), false);

    strictEqual(deepEquals({
      A: 2
    }, {}), false);
  });
});
