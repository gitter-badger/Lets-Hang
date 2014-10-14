var gulp = require('gulp');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var minify = require('gulp-uglify');

var bases = {
	main: 'letsHangMain/',
	frontCal: 'letsHangCalFront/',
	backCal: 'letsHangCal/'
};

var paths = {
	node: [bases.main+'**/*.js','!'+bases.main+'public','!'+bases.main+'views', '!'+bases.main+'node_modules/**'],
	mainJS: [bases.main+'public/js/**/*.js','!'+bases.main+'public/js/lib'],
	mainStyle: [bases.main+'public/css/**/*.css','!'+bases.main+'public/css/lib',bases.main+'public/sass/**/*.scss'],
	mainViews: [bases.main+'views'],
	mainJSLibs: [bases.main+'public/js/lib/**/*.js'],
	mainStyleLibs: [bases.main+'public/css/lib/**/*.css'],
	fCalJS: [bases.frontCal+'js/**/*.js'],
	fCalJSLib: [bases.frontCal+'bower_components'],
	fCalCSS: [bases.frontCal+'css/**/*.css','!'+bases.frontCal+'css/lib'],
	fCalCSSLib: [bases.frontCal+'css/lib/**/*.css'],
	fCalSass: [bases.frontCal+'sass/**/*.scss']
};
gulp.task('node-hint', function(){
	gulp.src(paths.node)
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});
gulp.task('scripts', function(){
	gulp.src(paths.mainJS)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(minify())
		.pipe(gulp.dest(paths.mainJS+'/min'));
});
gulp.task('styles', function(){
	gulp.src(paths.mainStyle)
		.pipe(sass())
		.pipe(minify())
		.pipe(gulp.dest(bases.main+'public/css/min'));
});
