// trying to prevent JS from doing stupid things / letting me do stupid things
'use strict'

// gulp configuration
const { src, dest, series, parallel, watch } = require('gulp')

// -----------------------------------------------------------------------
// babel configuration
const babel = require('gulp-babel')
// UglifyJS configuration
const uglify = require('gulp-uglify')

// -----------------------------------------------------------------------
// SASS configuration
const sass = require('gulp-sass')(require('sass'))
// cssnano configuration
const cssnano = require('gulp-cssnano')
// autoprefixer configuration
const autoprefixer = require('gulp-autoprefixer')
// rename configuration
const rename = require('gulp-rename')

// -----------------------------------------------------------------------
// imagemin configuration
const imagemin = require('gulp-imagemin') // does not work on version 8.0.0 ...
// const imagemin = import('gulp-imagemin');
// import imagemin from 'gulp-imagemin';

// -----------------------------------------------------------------------
// sourcemaps configuration (is limited, because it works only with plugins that are supported - list on npm)
const sourcemaps = require('gulp-sourcemaps')

// -----------------------------------------------------------------------
// Browser Sync configuration - Live Server replacement
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

// -----------------------------------------------------------------------
const clean = require('gulp-clean')

// -----------------------------------------------------------------------
const kit = require('gulp-kit')

// -----------------------------------------------------------------------
// paths configuration
const paths = {
	// src
	html: './src/html/**/*.kit',
	sass: './src/sass/**/*.scss',
	js: './src/js/**/*.js',
	img: './src/img/*',

	// dist
	dist: './dist',
	sassDist: './dist/css',
	jsDist: './dist/js',
	imgDist: './dist/img',
}

// -----------------------------------------------------------------------
function javaScript(done) {
	src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDist))
	done()
}

// -----------------------------------------------------------------------
function sassCompiler(done) {
	src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		// .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError)) // works the same as the cssnano but as far as I can tell cssnano is slightly faster
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDist))
	done()
}

// -----------------------------------------------------------------------
function convertImages(done) {
	src(paths.img).pipe(imagemin()).pipe(dest(paths.imgDist))
	done()
}

// -----------------------------------------------------------------------
function handleKits(done) {
	src(paths.html).pipe(kit()).pipe(dest('./'))
	done()
}

// -----------------------------------------------------------------------
// function to delete the entire "dist" folder
function cleanFiles(done) {
	src(paths.dist, { read: false }).pipe(clean())
	done()
}

// -----------------------------------------------------------------------
function startBrowserSync(done) {
	browserSync.init({
		server: {
			baseDir: './',
		},

		// Enable HTTPS for static file server
		// https: true,

		// Stop the browser from automatically opening
		open: false,

		// Don't show any notifications in the browser.
		notify: false,

		// Wait for 1 second before any browsers should try to inject/reload a file.
		// reloadDelay: 1000,

		// Use a specific port (instead of the one auto-detected by Browsersync - 3000)
		port: 3000,
	})
	done()
}

// -----------------------------------------------------------------------
function watchForChanges(done) {
	watch('./*.html').on('change', reload)
	watch([paths.html, paths.sass, paths.js], parallel(handleKits, sassCompiler, javaScript)).on('change', reload)
	watch(paths.img, convertImages).on('change', reload)
	done()
}

// -----------------------------------------------------------------------
// exports functions
exports.cleanFiles = cleanFiles
const functions = parallel(handleKits, sassCompiler, javaScript, convertImages)
const mainFunction = series(functions, startBrowserSync, watchForChanges)
exports.default = mainFunction
