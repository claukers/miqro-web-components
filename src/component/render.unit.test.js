const {fake, requireMock} = require("@miqro/test");
const {resolve} = require("path");
const {strictEqual} = require("assert");
const {distPath} = require("../setup-test.js");

const testFilePath = resolve(distPath, "cjs", "component", "render.js");

const testOptions = {
  category: "render.unit.test"
};

HTMLElement = class {

}

it("isConnected render returns string calls renderTemplate and appendChild", async () => {
  const nodeList = ["node1", "node2"];
  const nodeList2ArrayRet = "some value";
  const getTemplateLocation = fake(() => {

  });
  const nodeList2Array = fake(() => {
    return nodeList2ArrayRet;
  });
  const renderTemplate = fake(() => {
    return nodeList;
  });
  const component = {
    isConnected: true,
    render: fake(() => {
      return "stringtemplate"
    }),
    appendChild: fake((child) => {
      strictEqual(child, nodeList[component.appendChild.callCount - 1]);
    })
  };
  const {render} = requireMock(testFilePath, {
    "./template/index.js": {
      getTemplateLocation, nodeList2Array, renderTemplate
    }
  }, distPath);
  strictEqual(component.innerHTML, undefined);
  render(component);
  strictEqual(renderTemplate.callCount, 1);
  strictEqual(getTemplateLocation.callCount, 0);
  strictEqual(renderTemplate.callArgs[0][0], "stringtemplate");
  strictEqual(renderTemplate.callArgs[0][1].this, component);
  strictEqual(renderTemplate.callArgs[0][1].children, nodeList2ArrayRet);
  strictEqual(component.innerHTML, "");
  strictEqual(component.appendChild.callCount, 2);
}, testOptions);

it("isConnected static template exists in cache calls renderTemplate and appendChild", async () => {
  const nodeList = ["node1", "node2"];
  const nodeList2ArrayRet = ["node1-1", "node2-1"];
  const template = "templateString";
  const getTemplateLocation = fake(() => {
    return template;
  });
  const nodeList2Array = fake(() => {
    return nodeList2ArrayRet;
  });
  const renderTemplate = fake(() => {
    return nodeList;
  });
  const component = {
    isConnected: true,
    childNodes: "childNodes",
    constructor: {
      hasOwnProperty: fake(() => {
        return true;
      }),
      template: "templatePath"
    },
    appendChild: fake((child) => {
      strictEqual(child, nodeList[component.appendChild.callCount - 1]);
    })
  };
  const {render} = requireMock(testFilePath, {
    "./template/index.js": {
      getTemplateLocation, nodeList2Array, renderTemplate
    }
  }, distPath);
  strictEqual(component.innerHTML, undefined);
  render(component);
  strictEqual(renderTemplate.callCount, 1);
  strictEqual(renderTemplate.callArgs[0][0], template);
  strictEqual(renderTemplate.callArgs[0][1].this, component);
  strictEqual(renderTemplate.callArgs[0][1].children, nodeList2ArrayRet);
  strictEqual(nodeList2Array.callCount, 1);
  strictEqual(nodeList2Array.callArgs[0][0], "childNodes");
  strictEqual(component.constructor.hasOwnProperty.callCount, 1);
  strictEqual(component.constructor.hasOwnProperty.callArgs[0][0], "template");
  strictEqual(getTemplateLocation.callCount, 1);
  strictEqual(getTemplateLocation.callArgs[0][0], "templatePath");
  strictEqual(component.innerHTML, "");
  strictEqual(component.appendChild.callCount, 2);
}, testOptions);

it("isConnected static template doesn't in cache calls renderTemplate and appendChild after promise resolves", async () => {
  const nodeList = ["node1", "node2"];
  const template = "templateString";
  const nodeList2ArrayRet = "other value";
  const getTemplateLocation = fake(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(template);
      }, 0);
    });
  });
  const nodeList2Array = fake(() => {
    return nodeList2ArrayRet;
  });
  const renderTemplate = fake(() => {
    return nodeList;
  });
  const component = {
    isConnected: true,
    constructor: {
      hasOwnProperty: fake(() => {
        return true;
      }),
      template: "templatePath"
    },
    appendChild: fake((child) => {
      strictEqual(child, nodeList[component.appendChild.callCount - 1]);
    })
  };
  const {render} = requireMock(testFilePath, {
    "./template/index.js": {
      getTemplateLocation, nodeList2Array, renderTemplate
    }
  }, distPath);
  strictEqual(component.innerHTML, undefined);
  render(component);
  strictEqual(renderTemplate.callCount, 0);
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10);
  });
  strictEqual(renderTemplate.callCount, 1);
  strictEqual(renderTemplate.callArgs[0][0], template);
  strictEqual(renderTemplate.callArgs[0][1].this, component);
  strictEqual(renderTemplate.callArgs[0][1].children, nodeList2ArrayRet);
  strictEqual(component.constructor.hasOwnProperty.callCount, 1);
  strictEqual(component.constructor.hasOwnProperty.callArgs[0][0], "template");
  strictEqual(getTemplateLocation.callCount, 1);
  strictEqual(getTemplateLocation.callArgs[0][0], "templatePath");
  strictEqual(component.innerHTML, "");
  strictEqual(component.appendChild.callCount, 2);
}, testOptions);

it("isConnected false render returns string doesn't call renderTemplate", async () => {
  const getTemplateLocation = fake(() => {

  });
  const nodeList2Array = fake(() => {

  });
  const renderTemplate = fake(() => {

  });
  const component = {
    isConnected: false,
    render: fake(() => {
      return "stringtemplate"
    }),
    appendChild: fake(() => {
    })
  };
  const {render} = requireMock(testFilePath, {
    "./template/index.js": {
      getTemplateLocation, nodeList2Array, renderTemplate
    }
  }, distPath);
  render(component);
  strictEqual(renderTemplate.callCount, 0);
  strictEqual(component.innerHTML, undefined);
  strictEqual(component.appendChild.callCount, 0);
}, testOptions);
