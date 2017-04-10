var
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  htmlclean = require('gulp-htmlclean'),
  concat = require('gulp-concat'),
  stripdebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  cleanCSS = require('gulp-clean-css'),
  sourcemaps = require('gulp-sourcemaps'),
  gutil = require('gulp-util'),
  clean = require('gulp-clean'),
  argv = require('yargs').argv,
  browserSync = require('browser-sync').create(),

  // production build param
  isProduction = (argv.production === undefined) ? false : true;

  // folders
  folder = {
    src: 'src/',
    build: 'build/'
  }
;

// HTML processing
gulp.task('html', function() {
  var out = folder.build;

  return gulp.src(folder.src + '**/*.html')
    .pipe(newer(out))
    .pipe(isProduction ? htmlclean() : gutil.noop())
    .pipe(gulp.dest(out));

});

// CSS processing
gulp.task('css', function() {
  var cssBuild = gulp.src(folder.src + 'scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(sourcemaps.init());

  if (isProduction) {
    cssBuild = cssBuild.pipe(cleanCSS());
  }

  return cssBuild.pipe(sourcemaps.write())
    .pipe(gulp.dest(folder.build + 'css/'))
    .pipe(browserSync.stream());
});

// JavaScript processing
gulp.task('js', function() {

  var jsbuild = gulp.src(folder.src + 'js/**/*.js')
    .pipe(concat('main.js'));

  if (isProduction) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'js/'));

});

gulp.task('js-watch', ['js'], function (done) {
    browserSync.reload();
    done();
});

// optimaize images
gulp.task('images', function() {
  var out = folder.build + 'images/';
  return gulp.src(folder.src + 'images/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));
});

gulp.task('images-watch', ['images'], function (done) {
    browserSync.reload();
    done();
});

// browser sync server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: folder.build
        }
    });

    gulp.watch(folder.src + '**/*.html', ['html']).on('change', browserSync.reload);
    gulp.watch(folder.src + 'js/**/*.js', ['js']);
    gulp.watch(folder.src + 'images/**/*', ['images']);
    gulp.watch(folder.src + 'scss/**/*.scss', ['css']);
});

// clean build directory
gulp.task('clean', function () {
  return gulp.src(folder.build, {read: false})
    .pipe(clean());
});

// build task
gulp.task('build', ['html', 'css', 'js', 'images']);

// default task - builds and launches browser sync
gulp.task('default', ['build'], function() {
    console.log('Build complete -- Launching...');
    gulp.start('browser-sync');
});