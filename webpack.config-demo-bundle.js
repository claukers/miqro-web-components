const path = require('path');

module.exports = {
  mode: "production",
  entry: "./examples/app/front/src/index.js",
  output: {
    path: path.resolve(__dirname, "examples", "app", "front"),
    filename: 'bundle.js'
  }
};
