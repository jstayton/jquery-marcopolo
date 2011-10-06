var lint = require('./lint.js'),
    minify = require('./minify.js'),
    release = require('./release.js');

console.log('=== Lint');

lint(function () {
  console.log('=== Minify');

  minify(function () {
    console.log('=== Release');

    release();
  })
});
