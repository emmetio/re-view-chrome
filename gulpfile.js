'use strict';

const cp = require('child_process');
const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('style', () => {
    return gulp.src('./style/*.scss', {base: './'})
    .pipe(sass()).on('error', notify('SCSS Error'))
    .pipe(gulp.dest('./out'));
});

gulp.task('watch', ['build'], () => {
    gulp.watch('./style/**/*.scss', ['style']);
});

gulp.task('build', ['style']);
gulp.task('default', ['build']);

function notify(title) {
    return err => {
        if (process.platform === 'darwin') {
            cp.exec(`osascript -e 'display notification "${err.message}" with title "${title}"'`);
        }
    };
}
