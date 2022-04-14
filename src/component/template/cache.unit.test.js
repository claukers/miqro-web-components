const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "template", "cache.js");

const testOptions = {
  category: "component.template.cache unit tests"
};

it("cannot call setCache twice", async () => {
  const {setCache} = requireMock(testFilePath, {}, distPath);
  setCache({});
  try {
    setCache({});
  } catch (e) {
    strictEqual(e.message, "cannot reset cache");
  }
}, {
  category: "component.template.cache unit tests"
});

it("getTemplateLocation as string from cache returns string", async () => {
  const {
    setCache,
    getTemplateLocation
  } = requireMock(testFilePath, {}, distPath);
  fetch = null;
  const template = "templateString";
  const templatePath = "some path";
  setCache({
    [templatePath]: template
  });
  strictEqual(getTemplateLocation(templatePath), template);

}, testOptions);

it("getTemplateLocation as {url} from cache returns string", async () => {
  const {
    setCache,
    getTemplateLocation
  } = requireMock(testFilePath, {}, distPath);
  fetch = null;
  const template = "templateString";
  const templatePath = "some path";
  setCache({
    [templatePath]: template
  });
  strictEqual(getTemplateLocation({url: templatePath}), template);

}, testOptions);

it("getTemplateLocation as string not from cache uses fetch and returns promise", async () => {
  const {
    setCache,
    getTemplateLocation
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
  const promise = getTemplateLocation(templatePath);
  strictEqual(promise instanceof Promise, true);
  strictEqual(await promise, template);
  strictEqual(fakeResponse.text.callCount, 1);
  strictEqual(fetch.callCount, 1);
  strictEqual(fetch.callArgs[0][0], templatePath);
}, testOptions);

it("getTemplateLocation as {url} not from cache uses fetch and returns promise", async () => {
  const {
    setCache,
    getTemplateLocation
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
  const promise = getTemplateLocation({url: templatePath});
  strictEqual(promise instanceof Promise, true);
  strictEqual(await promise, template);
  strictEqual(fakeResponse.text.callCount, 1);
  strictEqual(fetch.callCount, 1);
  strictEqual(fetch.callArgs[0][0], templatePath);
}, testOptions);

it("getTemplateLocation as string not from cache uses fetch that fails and on second calls returns '' to avoid double fetch", async () => {
  const {
    setCache,
    getTemplateLocation
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
  const promise = getTemplateLocation(templatePath);
  strictEqual(promise instanceof Promise, true);
  try {
    await promise;
    strictEqual(false, true);
  } catch (e) {
    strictEqual(fakeResponse.text.callCount, 0);
    strictEqual(fetch.callCount, 1);
    strictEqual(fetch.callArgs[0][0], templatePath);
    strictEqual(getTemplateLocation(templatePath), "");
    strictEqual(fetch.callCount, 1);
  }
}, testOptions);
