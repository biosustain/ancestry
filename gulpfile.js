var gulp = require('gulp'),
    svgSprite = require('gulp-svg-sprite'),
    config = {
        shape: {
            dimension: {         // Set maximum dimensions
                maxWidth: 20,
                maxHeight: 20
            }
        },
        mode: {
            css: {
                dest: './',
                render: {
                    css: {
                        dest: './icons-sprite.css'       // relative to current output directory
                    }
                },
                sprite: './icons-sprite.svg'
            }
        }
    };

gulp.task('default', function () {
    gulp.src('icons/*.svg')
        .pipe(svgSprite(config))
        .pipe(gulp.dest('lib'));
});