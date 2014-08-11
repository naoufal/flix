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
      js: {
        expand: true,
        cwd: 'assets/js',
        src: 'include-*',
        dest: 'public/js',
        flatten: true
      },
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

    modernizr: {
      devFile : "assets/lib/modernizr/modernizr-dev.js",
      outputFile : "assets/lib/modernizr/modernizr-auto.js",
      // Based on default settings on http://modernizr.com/download/
      extra : {
        shiv : false,
        printshiv : false,
        load : true,
        mq : true,
        cssclasses : true
      },
      // Based on default settings on http://modernizr.com/download/
      extensibility : {
        addtest : true,
        prefixed : false,
        teststyles : false,
        testprops : false,
        testallprops : false,
        hasevents : false,
        prefixes : false,
        domprefixes : false
      },
      uglify : false,
      tests : [],  // Define any tests you want to implicitly include.
      parseFiles : true,
      files : ['assets/js/**/*.js', 'assets/scss/**/*.scss'],
      customTests : ['assets/lib/modernizr/modernizr-tests.js']
    },

    sass: {
      dev: {
        options: {
          outputStyle: ENV != 'development' ? 'nested' : 'compressed',
          noLineComments: ENV == 'development' ? false : true,
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

    uglify: {
      js: {
        files : [{
          expand: true,
          cwd: 'public/js',
          src:['**/*.js'],
          dest: 'public/js'
        }]
      }
    },

    cssmin: {
      minify: {
        expand: true,
        cwd: 'public/css',
        src: '*.css',
        dest: 'public/css'
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

    // Renames files based on a hash of their contents and saves a hashmap
    hashmap: {
      options: {
        output: 'assets/hashmap.json',
        rename: '#{= dirname}/#{= hash}.#{= basename}#{= extname}',
        keep: true,
        hashlen: 7,
        salt: 'pubweb-1'  // increment # to invalidate all hashes
      },
      all: {
        cwd: 'public',
        src: '**/*',
        dest: 'public-hashed'
      }
    },

    // fix urls in css files to use the hashmap urls
    cssurlrev: {
      options: {
        assets: '<%= hashmap.options.output %>',
        hashmap_rename: '<%= hashmap.options.rename %>'
      },
      all: {
        src: 'public-hashed/css/**/*.css'
      }
    },

    // clean
    clean: {
      build: ['public', 'public-hashed', 'assets/hashmap.json'],
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
  grunt.registerTask('build', ENV != 'development' ? 'build-dev' : 'build-prod');
  grunt.registerTask('build-prod', ['build-dev', 'minify', 'cssurlrev']);
  grunt.registerTask('build-dev', ['clean:build', 'modernizr', 'copy', 'jade', 'browserify', 'sass', 'hashmap', 'eslint']);

  grunt.registerTask('minify', ['cssmin', 'uglify']);
  grunt.registerTask('test', ['exec:remove_screens', 'exec:mkdir_screens', 'exec:run_tests']);
  grunt.registerTask('test:screens', ['test', 'exec:open_screens']);
}
