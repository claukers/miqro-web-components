const {fake, requireMock, describe, it} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "template", "utils", "cache.js");

describe("template.cache unit tests", () => {
  let oldDOMParser;
  before(function () {
    oldDOMParser = globalThis.DOMParser;
    globalThis.DOMParser = class {
      parseFromString() {

      }
    }
  });
  after(function () {
    globalThis.DOMParser = oldDOMParser;
  })
  it("cannot call setCache twice", async () => {
    const {setCache} = requireMock(testFilePath, {}, distPath);
    setCache({});
    try {
      setCache({});
    } catch (e) {
      strictEqual(e.message, "cannot reset cache");
    }
  });
  it("getTemplateFromLocation as string from cache returns string", async () => {
    const {
      setCache,
      getTemplateFromLocation
    } = requireMock(testFilePath, {}, distPath);
    fetch = null;
    const template = "templateString";
    const templatePath = "some path";
    setCache({
      [templatePath]: template
    });
    strictEqual(getTemplateFromLocation(templatePath).template, template);

  });
  it("getTemplateFromLocation as {url} from cache returns string", async () => {
    const {
      setCache,
      getTemplateFromLocation
    } = requireMock(testFilePath, {}, distPath);
    fetch = null;
    const template = "templateString";
    const templatePath = "some path";
    setCache({
      [templatePath]: template
    });
    strictEqual(getTemplateFromLocation({url: templatePath}).template, template);

  });
  it("getTemplateFromLocation as string not from cache uses fetch and returns promise", async () => {
    const {
      setCache,
      getTemplateFromLocation
    } = requireMock(testFilePath, {}, distPath);
    const template = "templateString";
    const templatePath = "some path";
    setCache({});
    const fakeResponse = {
      status: 200,
      text: fake(() => {
        return template;
      })
    };
    fetch = fake(async () => {
      return fakeResponse;
    });
    const promise = getTemplateFromLocation(templatePath);
    strictEqual(promise instanceof Promise, true);
    strictEqual((await promise).template, template);
    strictEqual(fakeResponse.text.callCount, 1);
    strictEqual(fetch.callCount, 1);
    strictEqual(fetch.callArgs[0][0], templatePath);
  });
  it("getTemplateFromLocation as {url} not from cache uses fetch and returns promise", async () => {
    const {
      setCache,
      getTemplateFromLocation
    } = requireMock(testFilePath, {}, distPath);
    const template = "templateString";
    const templatePath = "some path";
    setCache({});
    const fakeResponse = {
      status: 200,
      text: fake(() => {
        return template;
      })
    };
    fetch = fake(async () => {
      return fakeResponse;
    });
    const promise = getTemplateFromLocation({url: templatePath});
    strictEqual(promise instanceof Promise, true);
    strictEqual((await promise).template, template);
    strictEqual(fakeResponse.text.callCount, 1);
    strictEqual(fetch.callCount, 1);
    strictEqual(fetch.callArgs[0][0], templatePath);
  });
  it("getTemplateFromLocation as string not from cache uses fetch that fails and on second calls returns '' to avoid double fetch", async () => {
    const {
      setCache,
      getTemplateFromLocation
    } = requireMock(testFilePath, {}, distPath);
    const template = "templateString";
    const templatePath = "some path";
    setCache({});
    const fakeResponse = {
      status: 503,
      text: fake(() => {
        return template;
      })
    };
    fetch = fake(async () => {
      return fakeResponse;
    });
    const promise = getTemplateFromLocation(templatePath);
    strictEqual(promise instanceof Promise, true);
    try {
      await promise;
      strictEqual(false, true);
    } catch (e) {
      strictEqual(fakeResponse.text.callCount, 0);
      strictEqual(fetch.callCount, 1);
      strictEqual(fetch.callArgs[0][0], templatePath);
      strictEqual(getTemplateFromLocation(templatePath).template, "");
      strictEqual(fetch.callCount, 1);
    }
  });
});
