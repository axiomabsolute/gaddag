var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var exec = require('child_process').exec;
var browserify = require('browserify');
var tsify = require('tsify');
var source = require('vinyl-source-stream');

gulp.task("build", function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

function run() {
  return exec('node ./dist/main.js', function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
  });
}

gulp.task("run", function() {
  return run();
});

gulp.task('default', ['build'], function() {
  return run()
});

gulp.task('copy-data', function() {
  gulp.src('./src/data/*')
    .pipe(gulp.dest('dist/data'));
});

gulp.task('deploy', ['copy-data'], function() {
  return browserify()
    .add('src/browser.ts')
    .plugin(tsify, { noImplicitAny: true })
    .bundle()
    .on('error', function (error) { console.error(error.toString()); })
    .pipe(source("bundle.js"))
    .pipe(gulp.dest('./dist'));
});

var watchFiles = [
  './src/*.ts',
  './index.html'
];

gulp.task("watch", ['default'],  function() {
  gulp.watch('./src/**/*.ts', ['default']);
});

gulp.task("watch-deploy", ['deploy'], function() {
  gulp.watch(['./src/**/*.ts'], ['deploy']);
});