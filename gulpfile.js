var gulp         = require( 'gulp' ),
    gulpPlugins  = require( 'gulp-load-plugins' ),
    rsync        = require( 'rsyncwrapper' ),
    browserSync  = require( 'browser-sync' ),
    source       = require( 'vinyl-source-stream' ),
    stream       = require( 'event-stream' ),
    rupture      = require( 'rupture' ),
    jeet         = require( 'jeet' ),
    autoprefixer = require( 'autoprefixer' ),
    browserify   = require( 'browserify' ),
    reload       = browserSync.reload,
    $            = gulpPlugins();

/*==============================
=            Styles            =
==============================*/

gulp.task('styles:compile', () => {

  let processors = [
    autoprefixer({
      browsers: [ 'last 2 versions', 'Android >= 4', 'IE >= 9' ]
    })
  ];

  gulp
    .src( './src/styles/app.styl' )
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.stylus({
      'include css': true,
      use: [ jeet(), rupture() ]
    }))
    .pipe($.postcss( processors ))
    .pipe($.cssnano())
    .pipe($.sourcemaps.write( './' ))
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest( './public/css/' ))
    .pipe(reload({ stream: true }))
    .pipe($.notify({ onLast: true, message: function ( file ) { return 'CSS Modules Done.'; } }));
});

/*==================================
=            JavaScript            =
==================================*/

gulp.task('js:compile', () => {
  let entries = [
    'index.js'
  ];

  let bundles = entries.map(function ( entry ) {
    return browserify({
      basedir : './src/js/modules/pages/',
      entries : [ entry ]
    })
      .bundle()
      .pipe($.plumber())
      .pipe(source( 'pages/' + entry ))
      .pipe($.rename({ extname: '.bundle.js' }))
      .pipe(gulp.dest( './public/js/' ))
      .pipe(reload({ stream: true }));
  });

  return stream.merge.apply( null, bundles );
});

gulp.task('js:common', () => {
  return browserify({
    entries : './src/js/commons/settings.js'
  })
    .bundle()
    .pipe($.plumber())
    .pipe(source( 'common.js' ))
    .pipe(gulp.dest( './public/js/' ))
    .pipe(reload({ stream: true }))
    .pipe($.notify({ onLast: true, message: function ( file ) { return 'JS Common Done.'; } }));
});

gulp.task('js:vendors', () => {
  let pathBower = './bower_components/';

  return gulp.src([
    pathBower + 'jquery/dist/jquery.js',
    pathBower + 'jquery.easing/js/jquery.easing.js',
    pathBower + 'jquery.maskedinput/dist/jquery.maskedinput.js',
    pathBower + 'fastclick/lib/fastclick.js',
    pathBower + 'owl.carousel/dist/owl.carousel.js',
    pathBower + 'slimScroll/jquery.slimscroll.js',
    pathBower + 'velocity/velocity.js'
  ])
  .pipe($.plumber())
  .pipe($.concat( 'vendors.js' ))
  .pipe($.uglify())
  .pipe(gulp.dest( './public/js/' ))
  .pipe($.notify({ message: 'JS Vendors Done.' }));
});

/*==============================
=            Assets            =
==============================*/

gulp.task('assets:images', () => {
  gulp
    .src( './src/img/**/*' )
    // .pipe( $.imagemin() )
    .pipe($.changed( './public/img/' ))
    .pipe(gulp.dest( './public/img/' ))
    .pipe(reload({ stream: true }))
    .pipe($.notify({ onLast: true, message: function ( file ) { return 'Assets Done.'; } }));
});

gulp.task('assets:fonts', () => {
  gulp
    .src( './src/fonts/*' )
    .pipe($.changed( './public/fonts/' ))
    .pipe(gulp.dest( './public/fonts/' ))
    .pipe(reload({ stream: true }))
    .pipe($.notify({ onLast: true, message: function ( file ) { return 'Copy Fonts Done.'; } }));
});

gulp.task('watch', [ 'browser-sync' ], () => {
  gulp.watch('./src/styles/**/*',      [ 'css' ]);
  gulp.watch('./src/img/**/*',      [ 'assets' ]);
  gulp.watch('./src/js/**/*',          [ 'js']);
  gulp.watch('./public/**/*.html').on( 'change', browserSync.reload );
});

gulp.task('browser-sync', () => {
  browserSync.init(null, {
    proxy     : '',
    notify    : false
  });
});

/*==================================
=            Gulp Tasks            =
==================================*/

gulp.task('css',     [ 'styles:compile' ]);
gulp.task('js',      [ 'js:compile', 'js:common' ]);
gulp.task('assets',  [ 'assets:images', 'assets:fonts' ]);

gulp.task('default', [ 'assets', 'js:vendors', 'js', 'css', 'watch' ]);
