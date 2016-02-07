'use strict';

const path = require('path');
const stream = require('stream');
const gulp = require('gulp');
const sass = require('gulp-sass');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const zip = require('gulp-zip');
const js = require('./gulp-tasks/js-bundle');
const notify = require('./gulp-tasks/notify');
const pkg = require('./package.json');

const isWatching = ~process.argv.indexOf('watch');
const production = ~process.argv.indexOf('--production') || process.env.NODE_ENV === 'production';
const src = (pattern, options) => gulp.src(pattern, Object.assign({base: './'}, options || {}));
const dest = (pattern) => gulp.dest(pattern || './out');

gulp.task('style', () => {
    return gulp.src('./node_modules/livestyle-re-view/style/*.scss')
    .pipe(sass()).on('error', notify('SCSS Error'))
    .pipe(production ? cssnano() : pass())
    .pipe(gulp.dest('./out/style'));
});

gulp.task('script', () => {
    return src('./scripts/*.js', {read: false})
    .pipe(js({
		standalone: 'reView',
		debug: !production,
		watch: isWatching
	})).on('error', notify('JavaScript Error'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(production ? uglify() : pass())
	.pipe(!production ? sourcemaps.write('./') : pass())
    .pipe(dest());
});

gulp.task('assets', () => {
    return src(['./manifest.json', './icons/**'])
    .pipe(through(function(file, enc, next) {
        if (path.basename(file) === 'manifest.json') {
            var data = JSON.parse(file.contents.toString());
            data.version = pkg.version;
            file.contents = new Buffer(JSON.stringify(data));
        }
        next(null, file);
    }))
    .pipe(dest());
});

gulp.task('pack', ['build'], function() {
	return gulp.src(['**', '!*.{zip,map}'], {cwd: './out'})
	.pipe(zip('re-view.zip'))
	.pipe(dest());
});

gulp.task('watch', ['build'], () => {
    gulp.watch('./node_modules/livestyle-re-view/style/**/*.scss', ['style']);
    gulp.watch('./scripts/**/*.js', ['script']);
    gulp.watch('./manifest.json', ['assets']);
});

gulp.task('build', ['style', 'script', 'assets']);
gulp.task('default', ['build']);

function pass() {
	return through();
}

function through(transform, flush) {
    if (!transform) {
        transform = (obj, enc, next) => next(null, obj);
    }
    return new stream.Transform({
		transform,
        flush,
		objectMode: true
	});
}
