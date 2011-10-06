module.exports = function (callback) {
  var fs = require('fs'),
      path = require('path'),
      JSHINT = require('./lib/jshint').JSHINT,
      src = fs.readFileSync(path.normalize(__dirname + '/../src/jquery.marcopolo.js'), 'utf8'),
      options = {},
      passed = false,
      errors = {},
      error = {};

  options = {
    browser: true,
    jquery: true
  };

  process.stdout.write('Analyzing code with JSHint... ');

  passed = JSHINT(src, options);

  if (passed) {
    process.stdout.write("Passed!\n");

    callback && callback();
  }
  else {
    process.stdout.write("Failed!\n");

    errors = JSHINT.errors;

    for (var i = 0; i < errors.length; i++) {
    	error = errors[i];

    	console.log('Line ' + error.line + ': ' + error.evidence);
    	console.log(error.reason);
    }
  }
};
