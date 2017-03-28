(function () {
  'use strict';

  var gulp = require('gulp');
  var $ = require('gulp-load-plugins')();
  var esLintScripts = [
    'app/**/*.js',
    'gulpfile.js',

    '!bower_components/**',
    '!node_modules/**'
  ];

  gulp.task('lint', function () {
    return gulp.src(esLintScripts)
      .pipe($.eslint())
      .pipe($.eslint.format());
  });



  gulp.task('default', function () {

  });

  gulp.task('serve', function () {

  });

  gulp.task('build', function () {

  });

})();
