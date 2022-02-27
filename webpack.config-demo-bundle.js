const path = require('path');

module.exports = {
  mode: "production",
  entry: './test/data/app/front/src/index.js',
  output: {
    path: path.resolve(__dirname, 'test', "data", "app", "front"),
    filename: 'bundle.js'
  }
};
