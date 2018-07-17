var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var del = require('del');
var copy = require('gulp-copy');
var minifycss = require('gulp-minify-css');

// Define default destination folder

var dest = 'dist/';
var demo = 'demo/';



gulp.task('clean', function() {
    return del(['dist/*.js','dist/*.css', 'demo/*.js', 'demo/*.css']);
});

gulp.task('js', function() {

   var jsFiles = ['bower_components/jquery/dist/jquery.js',
       'bower_components/aframe/dist/aframe-v0.8.2.js', 'bower_components/moment/min/moment-with-locales.js',
       'bower_components/howler/dist/howler.js', 'bower_components/leaflet/dist/leaflet-src.js', 'bower_components/leaflet-providers/leaflet-providers.js',
       'bower_components/html2canvas/build/html2canvas.js', 'bower_components/leaflet-image/leaflet-image.js', 'bower_components/d3/d3.js', 'bower_components/tabletop/src/tabletop.js',
       'js/**/*.js'
   ];


    return gulp.src(jsFiles)
        .pipe(filter('**/*.js'))
        .pipe(concat('dataverse.js'))
        .pipe(rename('dataverse.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dest)).pipe(gulp.dest(demo));


});


gulp.task('css', function() {

	var cssFiles = ['css/*', 'bower_components/leaflet/dist/leaflet.css'];

	return gulp.src(cssFiles)
		.pipe(filter('**/*.css'))
		.pipe(concat('dataverse.css'))
        .pipe(rename('dataverse.min.css'))
		.pipe(minifycss())
		.pipe(gulp.dest(dest)).pipe(gulp.dest(demo));

});


gulp.task('default', ['clean'], function() {
    gulp.start('js');
    gulp.start('css');
});




