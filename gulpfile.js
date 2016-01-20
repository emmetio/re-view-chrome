'use strict';

const cp = require('child_process');
const gulp = require('gulp');
const sass = require('gulp-sass');
const js = require('./gulp-tasks/js-bundle');
const notify = require('./gulp-tasks/notify');

const isWatching = ~process.argv.indexOf('watch');
const production = ~process.argv.indexOf('--production');

gulp.task('style', () => {
    return gulp.src('./style/*.scss', {base: './'})
    .pipe(sass()).on('error', notify('SCSS Error'))
    .pipe(gulp.dest('./out'));
});

gulp.task('script', () => {
    return gulp.src('./scripts/*.js', {read: false, base: './'})
    .pipe(js({
		global: true,
		debug: false,
		watch: isWatching
	})).on('error', notify('JavaScript Error'))
    .pipe(gulp.dest('./out'));
});

gulp.task('watch', ['build'], () => {
    gulp.watch('./style/**/*.scss', ['style']);
    gulp.watch('./scripts/**/*.js', ['script']);
});

gulp.task('build', ['style', 'script']);
gulp.task('default', ['build']);
