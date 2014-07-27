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
        tasks: ['browserify', 'eslint']
      },
      sass: {
        files: ['assets/scss/**/*.{scss,sass}'],
        tasks: ['sass:dev'],
        spawn: false
      },
      jade_handlebars: {
        files: ['views/templates/**/*.jade'],
        tasks: ['jade:handlebars', 'browserify'],
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

    jade: {
      handlebars: {
        options: {
          pretty: true
        },
        expand: true,
        src: 'views/templates/**/*.jade',
        dest: 'assets/templates',
        ext: '.hbs',
        flatten: true
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
          ignore: ['node_modules/**', 'public/**', 'assets/**', 'test/**'],
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

    eslint: {
      options: {
        config: 'config/eslint/' + (ENV == 'development' ? 'development' : 'production') + '.json'
      },
      target: ['assets/js/**/*.js']
    },

    exec: {
      mkdir_screens: 'mkdir ./test/screenshots',
      remove_screens: 'rm -rf ./test/screenshots',
      open_screens: 'open ./test/screenshots',
      run_tests: 'NODE_ENV=test ./node_modules/.bin/se start && ./node_modules/.bin/mocha',
    }

  });

  // Task groups & aliases ///////////////////////////////////////
  grunt.registerTask('dev', ['build', 'concurrent']);
  grunt.registerTask('build', ['copy', 'jade', 'browserify', 'sass', 'eslint']);
  grunt.registerTask('test', ['exec:remove_screens', 'exec:mkdir_screens', 'exec:run_tests']);
  grunt.registerTask('test:screens', ['test', 'exec:open_screens']);
}