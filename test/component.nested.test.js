const {strictEqual} = require("assert");
const {fake, requireMock} = require("@miqro/test");
const {initDOMGlobals} = require("./common");
const fakes = initDOMGlobals();
const {decodeHTML, Component} = requireMock("../", {});

const testOptions = {
  category: "component.nested",
  before: () => {
    fakes.reset();
  },
  after: () => {
    fakes.reset();
  }
};

it("happy path", async () => {
  
}, testOptions);
