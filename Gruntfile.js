'use strict';

var nconf = require('nconf');
require('./config/init-config');

var ENV = nconf.get('NODE_ENV');

module.exports = function (grunt) {
  // load all grunt tasks automagically
  require('load-grunt-tasks')(grunt);

  // project config
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      js: {
        files: 'assets/js/**/*.js',
        spawn: false,
        tasks: 'browserify'
      },
      sass: {
        files: ['assets/scss/**/*.{scss,sass}'],
        tasks: ['sass:dev'],
        spawn: false
      },
      compiled_js: {
        files: 'public/js/**/*.js',
        spawn: false,
        options: { livereload: true }
      },
      compiled_css: {
        files: 'public/css/**/*.css',
        spawn: false,
        options: { livereload: true }
      }
    },

    copy: {
      fonts: {
        expand: true,
        cwd: 'assets/fonts',
        src: '**',
        dest: 'public/fonts',
        flatten: true
      },
      images: {
        expand: true,
        cwd: 'assets/images',
        src: '**',
        dest: 'public/images'
      }
    },

    sass: {
      dev: {
        options: {
          outputStyle: ENV == 'production' ? 'compressed' : 'nested',
          noLineComments: ENV == 'production' ? true : false,
          httpPath: '/',
          environment: ENV || 'development'
        },
        files: [{
          expand: true,
          cwd: 'assets/scss',
          src:['**/*.scss'],
          dest: 'public/css',
          ext: '.css'
        }]
      }
    },

    browserify: {
      bundle: {
        // A single entry point for our app
        src: 'assets/js/main.js',
        // Compile to a single file to add a script tag for in your HTML
        dest: 'public/js/bundle.js',
      }
    },

    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignoredFiles: ['node_modules/**'],
          watchedExtensions: ['js']
        }
      }
    },

    // Needed to run multiple blocking tasks together
    concurrent: {
      dev: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },

    exec: {
      run_tests: 'NODE_ENV=test ./node_modules/.bin/mocha'
    }

  });

  // Task groups & aliases ///////////////////////////////////////
  grunt.registerTask('dev', ['build', 'concurrent']);
  grunt.registerTask('build', ['copy', 'browserify', 'sass']);
  grunt.registerTask('test', ['exec:run_tests']);
}