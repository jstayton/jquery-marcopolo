/*global module:false*/
module.exports = function (grunt) {
  'use strict';

  var bannerRegex = /\/\*[\s\S]*?\*\//;

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: {
        widget: grunt.file.read('lib/jquery.ui.widget.js').match(bannerRegex)[0],
        source: grunt.file.read('src/jquery.marcopolo.js').match(bannerRegex)[0]
      }
    },
    lint: {
      files: ['grunt.js', 'src/*.js']
    },
    min: {
      widget: {
        src: ['<banner:meta.banner.widget>', 'lib/jquery.ui.widget.js'],
        dest: 'build/parts/jquery.ui.widget.min.js'
      },
      source: {
        src: ['<banner:meta.banner.source>', 'src/jquery.marcopolo.js'],
        dest: 'build/parts/jquery.marcopolo.min.js'
      }
    },
    concat: {
      widget: {
        src: 'lib/jquery.ui.widget.js',
        dest: 'build/parts/jquery.ui.widget.js'
      },
      source: {
        src: ['<banner:meta.banner.source>', '<file_strip_banner:src/jquery.marcopolo.js:block>'],
        dest: 'build/parts/jquery.marcopolo.js',
        separator: ''
      },
      unmin: {
        src: ['<config:concat.widget.dest>', '<config:concat.source.dest>'],
        dest: 'build/jquery.marcopolo.js'
      },
      min: {
        src: ['<config:min.widget.dest>', '<config:min.source.dest>'],
        dest: 'build/jquery.marcopolo.min.js',
        separator: '\n\n'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    component: {
      main: './build/jquery.marcopolo.min.js',
      dependencies: {
        jquery: '>=1.4.3'
      }
    },
    jasmine: {
      all: 'http://localhost:8000/test/runner.html'
    },
    jshint: {
      options: {
        // Enforcing
        bitwise: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        quotmark: 'single',
        regexp: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        maxlen: 120,
        // Relaxing
        boss: true,
        eqnull: true,
        sub: true,
        // Environment
        browser: true,
        jquery: true
      },
      globals: {
        define: true,
        process: true
      }
    },
    jqueryjson: {
      dependencies: {
        jquery: '>=1.4.3'
      },
      docs: 'https://github.com/jstayton/jquery-marcopolo/blob/master/README.md',
      demo: 'http://jstayton.github.com/jquery-marcopolo'
    },
    'saucelabs-jasmine': {
      all: {
        testname: 'jquery-marcopolo',
        tags: ['master'],
        urls: ['<config:jasmine.all>'],
        concurrency: 3,
        browsers: (function () {
          var compact = {
                'chrome': {
                  '*': ['Windows 2008', 'Mac 10.8', 'Linux']
                },
                'firefox': {
                  '3.6': 'Windows 2012',
                  '*': ['Windows 2012', 'Mac 10.6', 'Linux']
                },
                'internet explorer': {
                  '6': 'Windows 2003',
                  '7': 'Windows 2003',
                  '8': 'Windows 2003',
                  '9': 'Windows 2008',
                  '10': 'Windows 2012'
                },
                'ipad': {
                  '5.1': 'Mac 10.8',
                  '6': 'Mac 10.8'
                },
                'iphone': {
                  '5.1': 'Mac 10.8',
                  '6': 'Mac 10.8'
                },
                'opera': {
                  '11': 'Windows 2008',
                  '12': ['Windows 2008', 'Linux']
                },
                'safari': {
                  '5': ['Windows 2008', 'Mac 10.6'],
                  '6': 'Mac 10.8'
                }
              },
              expanded = [];

          Object.keys(compact).forEach(function (browserName) {
            Object.keys(compact[browserName]).forEach(function (version) {
              var platforms = compact[browserName][version];

              if (!Array.isArray(platforms)) {
                platforms = [platforms];
              }

              platforms.forEach(function (platform) {
                var options = {
                      browserName: browserName
                    };

                if (version !== '*') {
                  options.version = version;
                }

                if (platform) {
                  options.platform = platform;
                }

                expanded.push(options);
              });
            });
          });

          return expanded;
        })()
      }
    },
    server: {
      port: 8000,
      base: '.'
    },
    uglify: {}
  });

  var testTasks = ['lint', 'server', 'jasmine'];

  if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    grunt.loadNpmTasks('grunt-saucelabs');

    testTasks.push('saucelabs-jasmine');
  }

  grunt.registerTask('test', testTasks.join(' '));
  grunt.registerTask('default', 'test min concat component jquery-json');

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-jasmine-task');
  grunt.loadNpmTasks('grunt-jquery-json');
  grunt.loadNpmTasks('grunt-pkg-to-component');
};
