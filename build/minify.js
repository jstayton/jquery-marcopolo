module.exports = function (callback) {
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

  process.stdout.write('Sending jquery.marcopolo.js to Google Closure Compiler... ');

  request = http.request(options, function (response) {
    var widgetSrc = fs.readFileSync(path.normalize(__dirname + '/../lib/jquery.ui.widget.min.js'), 'utf8'),
        minifiedSrc = fs.createWriteStream(path.normalize(__dirname + '/../jquery.marcopolo.min.js')),
        srcHeader = /^\/\*[\s\S]*?\*\//.exec(src);

    process.stdout.write("Done!\n");

    response.setEncoding('utf8');

    process.stdout.write('Writing jquery.ui.widget.min.js to jquery.marcopolo.min.js... ');

    minifiedSrc.write(widgetSrc + "\n");

    process.stdout.write("Done!\n");

    process.stdout.write('Writing minified jquery.marcopolo.js to jquery.marcopolo.min.js... ');

    minifiedSrc.write(srcHeader + "\n");

    util.pump(response, minifiedSrc);

    process.stdout.write("Done!\n");

    callback && callback();
  });

  request.on('error', function (error) {
    process.stdout.write("Failed!\n");
    console.log(error.message);
  });

  request.write(body);
  request.end();
};
