import gulp from 'gulp';
import plumber from 'gulp-plumber';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import sourcemap from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import cssnano from 'gulp-cssnano';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import svgSprite from 'gulp-svg-sprite';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import { deleteAsync } from 'del';
import sync from 'browser-sync';
import includeFiles from 'gulp-include';
const sass = gulpSass(dartSass);

export const browsersync = () => {
  sync.init({
    server: {
      baseDir: './public/',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    port: 8080,
    ui: { port: 8081 },
    open: true,
  });
};

export const style = () => {
  return gulp.src('./src/styles/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss([autoprefixer({ grid: true })]))
    .pipe(cssnano({
      discardComments: {
        removeAll: true
      }
    }))
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('./public/css/'))
    .pipe(sync.stream());
};

export const js = () => {
  return gulp.src('./src/js/script.js')
    .pipe(plumber())
    .pipe(
      includeFiles({
        includePaths: './src/components/**/',
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'))
    .pipe(sync.stream());
};

export const pages = () => {
  return gulp.src('./src/pages/*.html')
    .pipe(
      includeFiles({
        includePaths: './src/components/**/',
      })
    )
    .pipe(gulp.dest('./public/'))
    .pipe(sync.reload({ stream: true, }));
};

export const fonts = () => {
  return gulp.src('./src/fonts/*.{woff,woff2}')
    .pipe(gulp.dest('./public/fonts/'));
};

export const images = () => {
  return gulp.src('./src/images/**/*')
    .pipe(imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo()
    ]))
    .pipe(gulp.dest('./public/images/'))
    .pipe(sync.stream());
};

export const sprite = () => {
  return gulp.src('./src/images/svg/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      },
    }))
    .pipe(gulp.dest('./public/img/'));
};

export const clean = () => {
  return deleteAsync(['public/*/']);
};

export const watchDev = () => {
  gulp.watch(['./src/styles/style.scss', './src/components/**/*.scss'], gulp.series(style)).on(
    'change',
    sync.reload
  );
  gulp.watch(['./src/js/script.js', './src/components/**/*.js'], gulp.series(js));
  gulp.watch('./src/images/**/*.{jpg,svg,png}', gulp.series(images));
  gulp.watch('./src/images/svg/*.svg', gulp.series(sprite));
  gulp.watch('./src/fonts/*.{woff,woff2}', gulp.series(fonts));
  gulp.watch(['./src/pages/*.html', './src/components/**/*.html'], gulp.series(pages)).on(
    'change',
    sync.reload
  );
};

gulp.task('build', gulp.series(
  clean,
  gulp.parallel(
    pages,
    style,
    js,
    images,
    sprite,
    fonts
  )));


export default gulp.series(
  clean,
  gulp.parallel(
    pages,
    style,
    js,
    images,
    sprite,
    fonts
  ),
  gulp.parallel(
    watchDev,
    browsersync
  )
);
