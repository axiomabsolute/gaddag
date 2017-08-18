var browserify = require('browserify');
var exec = require('child_process').exec;
var gulp = require("gulp");
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var ts = require("gulp-typescript");
var tsify = require('tsify');
var uglify = require('gulp-uglify');
var nodeResolve = require('resolve');
var mocha = require('gulp-mocha');

var tsProject = ts.createProject("tsconfig.json");

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

gulp.task('vendor', function() {
  var b = browserify();
  getNPMPackageIds().forEach(function(id) {
    b.require(nodeResolve.sync(id), { expose: id});
  });
  return b
    .bundle()
    .on('error', function(err) { console.log(err.message); this.emit('end'); })
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('app', ['copy-data'], function() {
  let b = browserify({
    debug: true,
    cache: {},
    packageCache: {}
  });

  getNPMPackageIds().forEach(function(id) {
    b.external(id);
  });

  return b
    .add('src/browser.ts')
    .plugin(tsify, {
      noImplicitAny: true
    })
    .bundle()
    .on('error', function (error) { console.error(error.toString()); })
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('deploy', ['vendor', 'app']);

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

gulp.task('test', ['build'], () => {
  return gulp.src('./test/**/*.spec.ts', { base: '.' })
    .pipe(tsProject())
    .pipe(gulp.dest('./dist'))
    .pipe(mocha({}))
    .on('error', (error) => console.error(error.toString()));
});

gulp.task('watch-test', ['test'], function() {
  gulp.watch(['./src/**/*.ts', './test/**/*.spec.ts'], ['test']);
});

function getNPMPackageIds() {
  // read package.json and get dependencies' package ids
  var packageManifest = {};
  try {
    packageManifest = require('./package.json');
  } catch (e) {
    // does not have a package.json manifest
  }
  return Object.keys(packageManifest.dependencies) || [];

}