const path = require('path');

module.exports = {
  mode: "production",
  entry: './dist/cjs/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webcomponents.bundle.min.js',
    libraryTarget: "var",
    library: "WebComponents"
  }
};
