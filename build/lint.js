var fs = require('fs'),
    path = require('path'),
    JSHINT = require('./lib/jshint').JSHINT,
    src = fs.readFileSync(path.normalize(__dirname + '/../src/jquery.marcopolo.js'), 'utf8'),
    options = {},
    passed = true,
    errors = {},
    error = {};

options = {
  browser: true,
  jquery: true
};

passed = JSHINT(src, options);

if (passed) {
  console.log('Passed JSHint!');
}
else {
  errors = JSHINT.errors;

  for (var i = 0; i < errors.length; i++) {
  	error = errors[i];

  	console.log('Line ' + error.line + ': ' + error.evidence);
  	console.log(error.reason);
  }

  console.log('Failed to pass JSHint!');
}
