module.exports = function(gulp, options, plugins) {
    gulp.task('default', function(done){
        plugins.gutil.log("+-------------------+".green);
        plugins.gutil.log("|    PixiAnimate    |".green);
        plugins.gutil.log("+-------------------+".green);
        plugins.gutil.log("Mode: ".gray, (options.argv.debug ? "Debug" : "Release").yellow);
        plugins.sequence(
            'clean',
            'stage',
            'vendor-copy',
            'build',
            'move',
            'package',
            'clean-stage',
            'uninstall',
            'pre-install',
            'install', 
            done
        );
    });  
};