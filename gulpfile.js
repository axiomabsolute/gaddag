var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var exec = require('child_process').exec;

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
  run();
});

gulp.task('default', ['build'], function() {
  run()
});

var watchFiles = [
  './src/*.ts'
];

gulp.task("watch", ['default'],  function() {
  gulp.watch('./src/*.ts', ['default']);
});