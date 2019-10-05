const gulp = require("gulp");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");
const pngquant = require("imagemin-pngquant");
const mozjpeg = require("imagemin-mozjpeg");
const browserSync = require("browser-sync").create();

//htmlのコピー
gulp.task("html", () => {
  return gulp
    .src("./src/**/*.html")
    .pipe(gulp.dest("./dist"));
});

//Pugのコンパイル
gulp.task("pug", () => {
  return gulp
    .src(["./src/**/*.pug", "!./src/**/_*.pug"])
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest("./dist"));
});

//Sassのコンパイル
gulp.task("sass", () => {
  return gulp
    .src("./src/assets/scss/**/*.scss")
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .pipe(postcss([autoprefixer({
      cascade: false
    }
    )]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist/assets/css"));
});

//jsのコピー
gulp.task("js", () => {
  return gulp
    .src("./src/**/*.js")
    .pipe(gulp.dest("./dist"));
});

//画像圧縮
gulp.task("imagemin", () => {
  return gulp
    .src("./src/assets/img/**/*.{png,jpg,jpeg,gif,svg}")
    .pipe(changed("./dist/assets/img"))
    .pipe(
      imagemin([
        pngquant({
          quality: [.7, .85]
        }),
        mozjpeg({
          quality: 85
        }),
        imagemin.svgo(),
        imagemin.gifsicle()
      ])
    )
    .pipe(gulp.dest("./dist/assets/img"));
});

//サーバーの立ち上げ
gulp.task("serve", () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
});

//ファイルの監視
gulp.task("watch", () => {
  const reload = (done) => {
    browserSync.reload()
    done()
  };
  gulp.watch("./src/**/*.html", gulp.task("html"));
  gulp.watch("./src/**/*.pug", gulp.task("pug"));
  gulp.watch("./src/assets/**/*.scss", gulp.task("sass"));
  gulp.watch("./src/**/*.js", gulp.task("js"));
  gulp.watch("./src/assets/img/**/*.{png,jpg,jpeg,gif,svg}", gulp.task("imagemin"));
  gulp.watch("./dist/**/*", reload);
});

//デフォルトのタスク作成
gulp.task("default",
  gulp.series("html", "pug", "sass", "js", "imagemin", gulp.parallel("serve", "watch"))
);