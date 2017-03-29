(function () {
  'use strict';

  var path = require('path');
  var gulp = require('gulp');
  var $ = require('gulp-load-plugins')();

  var del = require('del');
  var runSequence = require('run-sequence');
  var pkg = require('./package.json');
  var browserSync = require('browser-sync');
  var reload = browserSync.reload;

  gulp.task('clean', function (callback) {
    require('del')(['.tmp', 'dist'], {dot: true})
      .then(function (paths) {
        $.util.log('Deleted files and folders:\n', paths);
        callback();
      });
  });

  gulp.task('lint', function () {
    return gulp.src([
      'gulpfile.js',
      'app/**/*.js',
      '!bower_components/**',
      '!node_modules/**'
    ])
      .pipe($.eslint())
      .pipe($.eslint.format());
  });

  gulp.task('json', function () {
    gulp.src('app/json/**/*.json')
      .pipe(gulp.dest('dist/json'))
      .pipe($.size({title: 'json', showFiles: true, pretty: true}));
  });

  gulp.task('font', function () {
    gulp.src('app/font/**/*')
      .pipe(gulp.dest('dist/font'))
      .pipe($.size({title: 'font', showFiles: true, pretty: true}));
  });

  gulp.task('misc', function () {
    return gulp.src('app/favicon.png')
      .pipe(gulp.dest('dist'))
      .pipe($.size({title: 'misc', showFiles: true, pretty: true}));
  });

  gulp.task('copy', function () {
    gulp.src([
      'app/*',
      '!app/*.html'
    ], {
      dot: true
    })
      .pipe(gulp.dest('dist'))
      .pipe($.size({title: 'copy', showFiles: true, pretty: true}));
  });

  gulp.task('images', function () {
    gulp.src('app/images/**/*')
      .pipe($.cache($.imagemin({
        progressive: true,
        interlaced: true
      })))
      .pipe(gulp.dest('dist/images'))
      .pipe($.size({title: 'images', showFiles: false, pretty: true}));
  });

  gulp.task('styles', function () {
    var AUTOPREFIXER_BROWSERS = [
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 34',
      'safari >= 7',
      'opera >= 23',
      'ios >= 7',
      'android >= 4.4',
      'bb >= 10'
    ];

    return gulp.src([
      'app/styles/**/*.scss',
      'app/styles/**/*.css'
    ])
      .pipe($.newer('.tmp/styles'))
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        precision: 10
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      // .pipe(gulp.dest('.tmp/styles'))
      .pipe($.concat('app.min.css'))
      .pipe($.if('*.css', $.cssnano()))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/styles'))
      .pipe(gulp.dest('.tmp/styles'))
      .pipe($.size({title: 'styles', showFiles: true, pretty: true}));
  });

  gulp.task('scripts', function () {
    gulp.src([
      './app/scripts/**/*.js'
      // './app/scripts/app.js'
    ])
      .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      // .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('app.min.js'))
      .pipe($.uglify({
        wrap: true,
        preserveComments: false // 'all', 'license', 'function'
      }))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/scripts'))
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.size({title: 'scripts', showFiles: true, pretty: true}));
  });

  gulp.task('html', function () {
    return gulp.src('app/**/*.html')
      .pipe($.useref())

      // Minify any HTML
      .pipe($.if('*.html', $.htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,             // Gogle Analytics code
        minifyCSS: true
      })))
      // Output files
      .pipe(gulp.dest('dist'))
      .pipe($.if('*.html', $.size({title: 'html', showFiles: true})));
  });

  gulp.task('browsersync', function () {
    browserSync.init({
      server: './dist'
    });
  });

  gulp.task('serve', ['clean'], function () {

    browserSync({
      notify: false,
      // Customize the Browsersync console logging prefix
      logPrefix: 'ADB',
      server: ['app'],
      port: 3000
    });
    gulp.watch(['app/**/*.html'], reload);
    gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
    gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', reload]);
    gulp.watch(['app/images/**/*'], reload);
    gulp.watch(['app/json/**/*'], reload);

  });

  gulp.task('serve:dist', ['build'], function () {

    browserSync({
      notify: false,
      // Customize the Browsersync console logging prefix
      logPrefix: 'ADB',
      server: ['./dist'],
      port: 3000
    });
    gulp.watch(['app/**/*.html'], reload);
    gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
    gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', reload]);
    gulp.watch(['app/images/**/*'], reload);
    gulp.watch(['app/json/**/*'], reload);

  });
  gulp.task('build', ['clean'], function (cb) {
    runSequence(
      'styles', 'lint', 'scripts', 'html', 'images', 'json', 'font', 'copy',
      cb
    );
  });

  gulp.task('default', ['build']);

})();
