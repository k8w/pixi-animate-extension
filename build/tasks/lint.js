module.exports = function(gulp, options, plugins) {
    gulp.task('lint', function(){
        return gulp.src(options.lintFiles)
            .pipe(plugins.eslint({
                extends: 'eslint:recommended',
                parser: 'babel-eslint',
                rules: {
                    "no-console": 0,
                    "no-useless-escape": 0,
                    "no-unused-vars": 0
                },
                ecmaFeatures: {
                    modules: true
                },
                envs: [
                    'node',
                    'browser',
                    'es6'
                ]
            }))
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError());
    });
};
