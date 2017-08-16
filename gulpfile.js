var gulp = require('gulp');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify-es').default;
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var gutil = require('gulp-util');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('sass', function() {
  return gulp.src('app/scss/styles.scss')
	.pipe(sass()) // Using gulp-sass
  .pipe(gulp.dest('app/css'))
});
gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  // Other watchers
});

gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('docs'))
});
gulp.task('rules', function() {
  return gulp.src('app/js/rules.json')
  .pipe(gulp.dest('docs/js'))
});
gulp.task('img', function() {
  return gulp.src('app/img/**/*')
  .pipe(gulp.dest('docs/img'))
});
gulp.task('fonts', function() {
  return gulp.src([
		'app/fonts/knowledge2017-20170221/Knowledge2017-Regular.ttf',
		'app/fonts/knowledge2017-20170221/Knowledge2017-Bold.ttf'
	])
	.pipe(gulp.dest('docs/fonts'))
});
gulp.task('clean:docs', function() {
  return del.sync('docs');
})
gulp.task('build', function (callback) {
  runSequence('clean:docs',
    ['sass', 'useref', 'img', 'rules', 'fonts'],
    callback
  );
});
