module.exports = function(grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        uglify: {
            build: {
                files: {
                    'js/app.min.js': ['js/source/app.js'],
                    'js/plugin.min.js': ['js/source/plugin.js']
                }
            }
        },
        
        cssc: {
            build: {
                options: {
                    consolidateViaDeclarations: true,
                    consolidateViaSelectors:    true,
                    consolidateMediaQueries:    true
                },
                files: {
                    'css/app.css': 'css/app.css'
                }
            }
        },
        
        cssmin: {
            build: {
                src: 'css/app.css',
                dest: 'css/app.min.css'
            }
        },
        
        sass: {
            build: {
                files: {
                    'css/app.css': 'css/scss/app.scss'
                }
            }
        },
        
        watch: {
            js: {
                files: ['js/source/app.js'],
                tasks: ['uglify']
            },
            css: {
                files: ['css/scss/**/*.scss'],
                tasks: ['buildcss']
            }
        }
    });
    
    grunt.registerTask('default', []);
    grunt.registerTask('buildcss',  ['sass', 'cssc', 'cssmin']);
    grunt.option('force', true);
    
};