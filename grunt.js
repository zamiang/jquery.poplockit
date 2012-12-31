/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:lockit.jquery.json>',
        meta: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        coffee: {
            dist: {
                src: ['src/**/*.coffee'],
                options: {
                    bare: false,
                    preserve_dirs: true
                }
            },
            example: {
                src: ['example/js/**/*.coffee'],
                options: {
                    bare: false,
                    preserve_dirs: true
                }
            }

        },
        lint: {
            files: ['grunt.js', 'src/**/*.js', 'test/**/*.js', 'example/**/*.js']
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'qunit'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                jQuery: true
            }
        },
        uglify: {}
    });

    grunt.loadNpmTasks('grunt-coffee');

    // Default task.
    grunt.registerTask('default', 'coffee qunit concat min');

    // Travis CI task.
    grunt.registerTask('travis', 'qunit');
};
