const path = require('path');

// This helper function is not strictly necessary.
// I just don't like repeating the path.join a dozen times.
/*function srcPath(subdir) {
  return path.join(__dirname, "dist", subdir);
}*/

module.exports = {
  mode: "production",
  entry: './examples/sfc/src/index.js',
  output: {
    path: path.resolve(__dirname, 'examples', "sfc"),
    filename: 'app.bundle.min.js'/*,
    libraryTarget: "var",
    library: "WebComponents"*/
  }/*,
  resolve: {
    alias: {
      pages: srcPath('pages'),
      components: srcPath('components')
    },
    // ...
  }*/
};
