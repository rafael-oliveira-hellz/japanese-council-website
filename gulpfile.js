var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var sass = require('gulp-sass');

var conf = {
    // JavaScript
    appName: 'App.jsx',
    srcJs: './src/js',
    destName: 'App.js',
    destJs: './build',

    // SASS
    srcSass: './src/styles/scss',
    destSass: './src/styles/css'
};

function compile(watch) {
    var bundler = watchify(
        browserify(conf.srcJs + '/' + conf.appName, {
            debug: true
        })
        .transform(babel.configure({
            presets: ['es2015', 'react']
        }))
    );

    function rebundle() {
        bundler.bundle()
            .on('error', function (err) {
                console.error(err);
                this.emit('end');
            })
            .pipe(source(conf.destName))
            .pipe(buffer())
            .pipe(sourcemaps.init({
                loadMaps: true
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(conf.destJs));
    }

    if (watch) {
        bundler.on('update', function () {
            console.log('-> bundling...');
            rebundle();
            console.log('->Done');
        });
    }

    rebundle();
}

function watch() {
    return compile(true);
};


gulp.task('build', function () {
    return compile();
});
gulp.task('watch', ['sass:watch'], function () {
    return watch();
});
gulp.task('default', ['watch']);

gulp.task('sass', function () {
    return gulp.src(conf.srcSass + '/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest(conf.destSass));
});
gulp.task('sass:watch', function () {
    gulp.watch(conf.srcSass + '/**/*.scss', ['sass']);
});