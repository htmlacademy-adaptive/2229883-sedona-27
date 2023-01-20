import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import del from 'del';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

export const script = () => {
  return (gulp.src('source/js/*.js'))
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}

export const optimizeimages = () => {
  return (gulp.src('source/images/**/*.{jpg,png}'))
    .pipe(squoosh())
    .pipe(gulp.dest('build/images'));
}

export const copyimages = () => {
  return (gulp.src('source/images/**/*.{jpg,png}'))
    .pipe(squoosh())
    .pipe(gulp.dest('build/images'));
}

export const createWebp = () => {
  return (gulp.src('source/images/**/*.{jpg,png}'))
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/images'));
}

export const svg = () =>
  gulp.src(['source/images/*.svg', '!source/images/logos/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/images'));

export const sprite = () =>
  gulp.src(['source/images/logos/*.svg'])
    .pipe(svgo())
    .pipe(svgstore({
      inLineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/images'));

export const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

export const clean = () => {
  return del ('build');
};
// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

const reload = (done) => {
  browser.reload ();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
  gulp.watch('source/js/script.js', gulp.series(script));
}

export const build = gulp.series (
  clean,
  copy,
  optimizeimages,
  gulp.parallel (
  styles,
  html,
  script,
  svg,
  sprite,
  createWebp
),
);


export default gulp.series(
  clean,
  copy,
  copyimages,
  gulp.parallel (
    styles,
    html,
    script,
    svg,
    sprite,
    createWebp
  ),
  gulp.series (
    server,
    watcher
  )
);
