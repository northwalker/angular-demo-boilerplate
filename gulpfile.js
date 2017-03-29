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

  var gitHash = '';

  gulp.task('clean', function (callback) {
    del(['.tmp', 'dist'], {dot: true})
      .then(function (paths) {
        $.util.log('Deleted files and folders:\n', paths);
        callback();
      });
  });

  gulp.task('git:hash', function (callback) {
    $.git.revParse({args: '--short HEAD'}, function (err, hash) {
      // if (err) return;
      if (hash) {
        gitHash = hash;
        $.util.log('current git hash: ' + hash);
      }
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

  gulp.task('eslint', ['lint'], function () {
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
    return gulp.src([
      'app/*',
      '!app/favicon*',
      '!app/*.html'
    ], {
      dot: true
    })
      .pipe(gulp.dest('dist'))
      .pipe($.size({title: 'copy', showFiles: true, pretty: true}));
  });

  gulp.task('images', function () {
    return gulp.src('app/images/**/*')
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
      .pipe($.if('*.css', $.csso()))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/styles'))
      .pipe(gulp.dest('.tmp/styles'))
      .pipe($.size({title: 'styles', showFiles: true, pretty: true}));
  });

  gulp.task('scripts', function () {
    return gulp.src([
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
      .pipe($.if('*.js', $.uglify()))
      .pipe($.if('*.css', $.csso()))
      .pipe($.replace('<meta name="version" content="">', '<meta name="version" content="' + gitHash + '">'))
      .pipe($.htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        // removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,  // Gogle Analytics code
        minifyCSS: true
      }))
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
      'lint',
      'git:hash',
      ['styles', 'scripts'],   // run in parallel
      'html',
      ['images', 'json', 'font', 'misc', 'copy'],
      cb
    );
  });

  gulp.task('default', ['build']);

})();
