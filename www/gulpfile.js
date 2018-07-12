var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var del = require('del');
var mainbowerfiles = require('main-bower-files');
var minifycss = require('gulp-minify-css');

// Define default destination folder

var dest = 'dist/';



gulp.task('clean', function() {
    return del(['dist/*.js','dist/*.css']);
});

gulp.task('js', function() {

//    <script src="bower_components/jquery/dist/jquery.min.js"></script>
//    <script src="bower_components/aframe/dist/aframe-v0.8.2.min.js"></script>
//    <script src="bower_components/moment/min/moment-with-locales.min.js"></script>
//    <script src="bower_components/howler/dist/howler.min.js"></script>
//    <script src="bower_components/leaflet/dist/leaflet.js"></script>
//    <script src="bower_components/leaflet-providers/leaflet-providers.js"></script>
//    <script src="bower_components/html2canvas/build/html2canvas.min.js"></script>
//    <!--<script src="bower_components/leaflet-image/leaflet-image.js"></script>-->
//
//    <script src="bower_components/d3/d3.min.js"></script>
//
//    <script src="bower_components/tabletop/src/tabletop.min.js"></script>


   var jsFiles = ['bower_components/jquery/dist/jquery.js',
       'bower_components/aframe/dist/aframe-v0.8.2.js', 'bower_components/moment/min/moment-with-locales.js',
       'bower_components/howler/dist/howler.js', 'bower_components/leaflet/dist/leaflet-src.js', 'bower_components/leaflet-providers/leaflet-providers.js',
       'bower_components/html2canvas/build/html2canvas.js', 'bower_components/leaflet-image/leaflet-image.js', 'bower_components/d3/d3.js', 'bower_components/tabletop/src/tabletop.js',
       'js/**/*.js'
   ];


//    return gulp.src(mainbowerfiles().concat(jsFiles))
    return gulp.src(jsFiles)
        .pipe(filter('**/*.js'))
        .pipe(concat('dataverse.js'))
        .pipe(rename('dataverse.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dest));

});

gulp.task('css', function() {

	var cssFiles = ['css/*', 'bower_components/leaflet/dist/leaflet.css'];

	gulp.src(cssFiles)
		.pipe(filter('**/*.css'))
		.pipe(concat('dataverse.css'))
        .pipe(rename('dataverse.min.css'))
		.pipe(minifycss())
		.pipe(gulp.dest(dest));

});


gulp.task('default', ['clean'], function() {
    gulp.start('js');
    gulp.start('css');
});




