import { rollup } from 'rollup'
import { minify } from 'rollup-plugin-esbuild-minify'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import rename from 'gulp-rename'
import gulp from 'gulp'

// javascript
function minify_file(file, name, args) {
    const {
        do_minify = true,
        output_dir = './libs',
    } = args ?? {};

    const plugins = [ json(), resolve(), commonjs() ];
    if (do_minify) {
        plugins.push(minify());
    }

    return rollup({
        input: file,
        plugins: plugins,
    }).then(bundle => {
        return bundle.write({
            dir: output_dir,
            format: 'iife',
            name: name,
        });
    });
}

// minify babel
gulp.task('minify-babel', () => minify_file('js/babel.js', 'babel'));

// minify marked
gulp.task('minify-marked', () => minify_file('js/marked.js', 'marked'));

// minify codemirror
gulp.task('minify-codemirror', () => minify_file('js/codemirror.js', 'cm'));

// minify mathjax
gulp.task('minify-mathjax', () => gulp.src(['node_modules/mathjax/es5/tex-svg.js'])
    .pipe(rename('mathjax.js'))
    .pipe(gulp.dest('./libs'))
);

// minify all
gulp.task('minify', gulp.parallel('minify-babel', 'minify-marked', 'minify-codemirror', 'minify-mathjax'));

// build all
gulp.task('build', gulp.parallel('minify'));
