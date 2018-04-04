//Plugins einbinden
let gulp = require("gulp"),// Um die Tasks auszuführen
    exec = require("child_process").exec,
    gutil = require("gulp-util"),//Für Ausgaben in der Konsole
    browserify = require("gulp-browserify"),//Integriert die Bibliotheken die man mit require importiert in die script.js Datei, sodass man in der HTML-Datei nur script.js importieren muss
    babel = require("gulp-babel"),
    nodemon = require("gulp-nodemon"),//Startet den index.js Server
    compass = require("gulp-compass"),//Komprimiert die CSS-Dateien
    minifyCSS = require("gulp-minify-css"),
    gulpif = require("gulp-if"),//Gulp-If Abfragen
    uglify = require("gulp-uglifyes"),//Komprimiert die JS-Dateien. Endung "es" steht für ES16,falss man ES16 verwendet, sonst kann man "gulp-uglify" nehmen
    minifyHTML = require("gulp-minify-html"),//Komprimiert die html-Dateien
    gzip = require("gulp-gzip"), //Weitere Komprimierung der Textdateien
    livereload = require("gulp-livereload"),//Automatische Aktualisierung des Browsers. Im Browser aber die Erweiterung LiveReload installiert werdem
    imagemin = require("gulp-imagemin"),// Images minimieren
    pngcrush = require("imagemin-pngcrush"), //Alle Typen von Images-----------------------------------
    concat = require("gulp-concat"),//Fasst alle JS-Datein in ein Script
    path = require("path"),
    swPrecache = require("sw-precache");//Service Worker wird automatisch generiert

//Variablen
let env,
    htmlSources,
    jsSources,
    sassSources,
    outputDir;

//Environmentvariable
env = process.env.NODE_ENV || "development";

//Damit man auf Wunsch die Daten zum Ordner "production" weiterleiten kann
if(env === "development") {
    outputDir = "builds/development/";
}
else{
    outputDir = "builds/production/";
}

//Dateien Quellen
htmlSources = [outputDir + "*.html"];
jsSources = ["components/scripts/**/*.js"];
sassSources = ["components/sass/style.scss"];

//Generiert einen Service-Worker
gulp.task("generate-service-worker", function(callback) {
    swPrecache.write(path.join(outputDir, "service-worker.js"), {
        staticFileGlobs: [
            outputDir + "**/*.{js,html,json,css,png,jpg,gif,svg,eot,svg,ttf,woff,woff2}"],
        importScripts: ["push.js"],
        navigateFallback: ["index.html"],
        maximumFileSizeToCacheInBytes: 3145728,
        stripPrefix: outputDir
    }, callback);
});

//Fasst alle JS-Dateien in eine zusammen(script.js)
//Bindet auch exterene APIs in diese Datei ein (browserify).
//Babel-Transpiler um ES6 zu ES5 zu übersetzen, damit App auf älteren Browsern läuft
gulp.task("js", function () {
    gulp.src(jsSources)
        .pipe(concat("script.js"))
        .pipe(browserify())
        .pipe(babel({
            presets: ["env"],
            compact: false
        }))
        .pipe(gulpif(env==="production", uglify()))//In Production wird auch JS komprimiert
        .pipe(gulp.dest(outputDir + "js"))
        .pipe(livereload());
});//js

//Fasst alle Sass-Dateien in eine zusammen und kompiliertd diese zu CSS(style.css)
gulp.task("compass", function () {
    gulp.src(sassSources)
        .pipe(compass({
            sass: "components/sass",
            images: outputDir + "images"
        }))
        .pipe(gulpif(env==="production", minifyCSS()))//In Production wird auch CSS komprimiert
        .pipe(gulp.dest(outputDir + "css"))
        .pipe(livereload());
});

//Komprimiert und verschiebt HTML in production-Ordner
gulp.task("html", function () {
    gulp.src("builds/development/**/*.html")
        .pipe(gulpif(env==="production", minifyHTML()))
        .pipe(gulpif(env==="production", gulp.dest(outputDir)))
        .pipe(livereload());
});

//Komprimiert und verschiebt Bilder in production-Ordner
gulp.task("images", function () {
    gulp.src("builds/development/images/**/*.*")//Alle unterordner im Ordner Images und alle Dateien in diesen Ordner
        .pipe(gulpif(env==="production", imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false}],
            use: [pngcrush()]
        })))
        .pipe(gulpif(env==="production", gulp.dest(outputDir + "images")))
        .pipe(livereload());
});

//Üverwacht die Tasks
gulp.task("watch", function () {
    gulp.watch("builds/development/**/*.html", ["html", "generate-service-worker"]);
    gulp.watch(jsSources, ["js", "generate-service-worker"]);
    gulp.watch("components/sass/*.scss", ["compass", "generate-service-worker"]);
    gulp.watch("builds/development/images/**/*.*", ["images", "generate-service-worker"]);
    gulp.watch("builds/development/css/fonts/**/*.{ttf,woff,woff2,eot,svg}", ["copyfonts"]);
});//Task der die Änderungen in den JS -und Scss-Datein überwacht

//Kopiert die Fonts in den production-Ordner
gulp.task("copyfonts", function() {
    gulp.src("builds/development/fonts/**/*.{ttf,woff,woff2,eot,svg}")
        .pipe(gulpif(env==="production", gulp.dest(outputDir + "fonts")));
});

//Kopiert die Manifest-Datei in den production-Ordner
gulp.task("copymanifest", function() {
    gulp.src("builds/development/manifest.json")
        .pipe(gulpif(env==="production", gulp.dest(outputDir)));
});

//Kopiert die js in den production-Ordner
gulp.task("copyjs", function() {
    gulp.src("builds/development/*.js")
        .pipe(gulpif(env==="production", uglify()))//In Production wird auch JS komprimiert
        .pipe(gulpif(env==="production", gulp.dest(outputDir)))
});

//Kopiert die js in den production-Ordner
gulp.task("copyjs2", function() {
    gulp.src("builds/development/js/database/*.js")
        .pipe(gulpif(env==="production", uglify()))//In Production wird auch JS komprimiert
        .pipe(gulpif(env==="production", gulp.dest(outputDir + "js/database/")))
});

//Startet den Server
gulp.task("server", ["copyjs", "copyjs2", "copymanifest"], function() {
    // Lauschen auf Änderungen
    livereload.listen();
    //nodemon Konfiguration
    nodemon({
        //Skript zum Ausführen der App
        script: outputDir + "index.js",
        ext: "js",
    }).on("restart", function(){
        //Wenn die App neugestartet wurde, starte livereload.
        gulp.src(outputDir + "index.js")
            .pipe(livereload());
    });
});

//Startet den Monogo Server
gulp.task("start_mongodb", function () {
    exec("mongod");
    exec("mongo");
});

//Default Task: Startet alles
//Der Task wird automatisch ausgeführt, wenn der gulp-Befehl mit egal welchem Parameter ausgeführt wird
gulp.task("default", ["copyfonts", "js", "compass", "images", "html", "server", "start_mongodb", "watch", "generate-service-worker"]);