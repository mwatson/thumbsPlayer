module.exports = function(grunt) {

        grunt.initConfig({
                pkg: grunt.file.readJSON('package.json'),

                player: {
                        src: 'player/player.js',
                        dest: 'dist/player.min.js'
                },
                plugins: {
                        src: 'player/plugins/*.js'
                }, 
                jplayer: {
                        src: 'player/jplayer/jplayer.min.js'
                }, 


                jshint: {
                        player: [ '<%= player.src %>' ],
                        plugins: [ '<%= plugins.src %>' ]
                }, 

                concat: {
                        playerandplugins: {
                                src: [ '<%= player.src %>', '<%= plugins.src %>' ],
                                dest: '<%= player.dest %>'
                        },
                        jplayer: {
                                src: [ '<%= player.dest %>', '<%= jplayer.src %>' ],
                                dest: '<%= player.dest %>'
                        }
                },

                uglify: {
                        options: {
                                banner: "/* <%= pkg.name %> v<%= pkg.version %> */\n"
                        },
                        player: {
                                src: '<%= player.src %>',
                                dest: '<%= player.dest %>'
                        }
                }
        });

        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-uglify');

        // default target will build just the standard player
        grunt.registerTask('default', [ 'jshint:player', 'uglify:player' ]);

        // builds the full player with plugins
        grunt.registerTask('with-plugins', [ 'jshint:player', 'jshint:plugins', 'concat:playerandplugins', 'uglify:player' ]);

        // builds player + plugins + jplayer
        grunt.registerTask('full-dist', [ 'jshint:player', 'jshint:plugins', 'concat:playerandplugins', 'uglify:player', 'concat:jplayer' ]);

        // builds player + plugins + jplayer but doesn't uglify
        grunt.registerTask('full-dev', [ 'jshint:player', 'jshint:plugins', 'concat:playerandplugins', 'concat:jplayer' ]);
};
