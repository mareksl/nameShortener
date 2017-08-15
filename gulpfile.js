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
			.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});
gulp.task('rules', function() {
  return gulp.src('app/js/rules.json')
  .pipe(gulp.dest('dist/js'))
});
gulp.task('img', function() {
  return gulp.src('app/img/**/*')
  .pipe(gulp.dest('dist/img'))
});
gulp.task('fonts', function() {
  return gulp.src(['app/fonts/knowledge2017-20170221/Knowledge2017-Regular.ttf', 'app/fonts/knowledge2017-20170221/Knowledge2017-Bold.ttf'])
	.pipe(gulp.dest('dist/fonts'))
});
gulp.task('clean:dist', function() {
  return del.sync('dist');
})
gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'img', 'rules', 'fonts'],
    callback
  );
});
