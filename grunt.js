/**
 * gruntfile (gruntjs.com)
 * 1. install sass
 * 2. install uglifyjs. if not yet, exec `npm install -g uglify-js`
 * 3. install coffee-script. if not yet, exec `npm install -g coffee-script`
 * 4. install sqwish. if not yet, exec `npm install -g sqwish`
 * 5. now grunt works. exec `grunt`
 */
module.exports = function(grunt){

  grunt.initConfig({

    concat: {
      search: {
        src: [
          'src/c4u.js'
        ],
        dest: 'build/c4u.js'
      }
    },

    min: {
      dest:{
        src: [ 'build/c4u.js' ],
        dest: 'build/c4u.min.js'
      }
    },

    watch: {
      jsfiles: {
        files: [ 'src/*.js' ],
        tasks: 'concat min'
      }
    }

  });

  // grunt.loadTasks('_tasks');
  grunt.registerTask('default', 'concat min');

};
