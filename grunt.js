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
    component: {},
    jasmine: {
      all: 'test/runner.html'
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
        define: true
      }
    },
    uglify: {}
  });

  grunt.registerTask('default', 'lint jasmine min concat component');

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-jasmine-task');
  grunt.loadNpmTasks('grunt-pkg-to-component');
};
