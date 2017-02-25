var gulp = require('gulp');
var nodemon = require('gulp-nodemon');


var jsFiles = ['*.js','src/**/*.js']; 

gulp.task('default', [], function(){
	var options = {
		script: 'app.js',
		delayTime: 1,
		env: {
			'PORT' : 3005
		},
		ignore: ['./nome_modules/**'],
		watch: jsFiles
	}
	return nodemon(options)
				.on('restart', function(ev){
					console.log('Restarting...');
				});
});