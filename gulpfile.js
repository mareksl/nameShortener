var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify-es').default;
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var del = require('del');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');


gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('docs'));
});

gulp.task('rules', function() {
  return gulp.src('app/js/rules.json')
  .pipe(gulp.dest('docs/js'));
});

gulp.task('img', function() {
  return gulp.src('app/img/**/*')
  .pipe(gulp.dest('docs/img'));
});

gulp.task('fonts', function() {
  return gulp.src([
		'app/fonts/knowledge2017-20170221/Knowledge2017-Regular.ttf',
		'app/fonts/knowledge2017-20170221/Knowledge2017-Bold.ttf'
	])
	.pipe(gulp.dest('docs/fonts/knowledge2017-20170221'))
});

gulp.task('clean:docs', function() {
  return del.sync('docs');
});

gulp.task('build', function (callback) {
  runSequence('clean:docs', 'sass',
    ['useref', 'img', 'rules', 'fonts'],
    callback
  );
});

gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
});


gulp.task('browser-sync', ['sass'], function() {
	browserSync.init({
	    server: "app",
			notify: true
	});
	gulp.watch('app/scss/*.scss', ['sass']);
	gulp.watch("app/index.html").on('change', browserSync.reload);
});

gulp.task('sass', function() {
  return gulp.src('app/scss/styles.scss')
	.pipe(sass())
  .pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
	.on('end', function(){ gutil.log('Sass done!');
	});
});
