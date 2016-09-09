var gulp = require('gulp');
var uglify =  require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('minify', function() {
    return gulp.src('dist/*.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['minify']);