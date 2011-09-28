var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    qs = require('querystring'),
    util = require('util'),
    src = fs.readFileSync(path.normalize(__dirname + '/../src/jquery.marcopolo.js'), 'utf8'),
    body = {},
    options = {},
    request;

body = qs.stringify({
  js_code: src,
  compilation_level: 'SIMPLE_OPTIMIZATIONS',
  output_info: 'compiled_code',
  output_format: 'text'
});

options = {
  host: 'closure-compiler.appspot.com',
  path: '/compile',
  method: 'POST',
  headers: {
    'Content-Length': body.length,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

console.log('Sending source code to Google Closure Compiler...');

request = http.request(options, function (response) {
  var widgetSrc = fs.readFileSync(path.normalize(__dirname + '/../lib/jquery.ui.widget.min.js'), 'utf8'),
      minified = fs.createWriteStream(path.normalize(__dirname + '/../jquery.marcopolo.min.js')),
      srcHeader = /^\/\*[\s\S]*?\*\//.exec(src);

  response.setEncoding('utf8');

  console.log('Writing jQuery UI Widget library to jquery.marcopolo.min.js...');

  minified.write(widgetSrc + "\n")

  console.log('Writing minified code to jquery.marcopolo.min.js...');

  minified.write(srcHeader + "\n");

  util.pump(response, minified);

  console.log('Finished minification!')
});

request.on('error', function (error) {
  console.log('Error! ' + error.message)
});

request.write(body);
request.end();
