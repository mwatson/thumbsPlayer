thumbsPlayer
============

thumbsPlayer is an HTML5 audio player that I originally wrote for the Idle Thumbs
Podcast Network, which is a podcast network that also has a podcast named Idle 
Thumbs. The goal of the player was to be simple to use, drop-inable and customizable.

Relevant Files
--------------

**player.js** is the uncompressed, commented player.

**player.min.js**, as you may have guessed, is the minified version.

Prerequisites
-------------

All that's needed to get thumbsPlayer working is some new-ish version of jQuery.  
It was written while 1.7.1 was the released version, so I wouldn't try it with a 
version older than that. It has been tested with and works with both jQuery 1.x 
and 2.x.

Setting Up
----------

As noted in player.js, setting up a player requires some specific HTML elements 
along with some Javascript to initialize the player(s).

### HTML

Every player should have (but doesn't require) an ID. Within the parent element 
you may also include the following optional elements. Note that elements don't 
have to be divs, only the class matters.

        <div id="player">
                <!--
                        This acts as the play/pause button. When
                        playing it will have class 'pause' and when
                        not playing it will have class 'play'.
                -->
                <div class="controlSingle"></div>
                
                <!--
                        Acts as the scrub bar. An empty div will be
                        appended to it that will have its width continually
                        adjusted (by percent) to represent the position of
                        the audio. It can also be clicked to skip around.
                        
                        A span will also be appended into the empty div that
                        can be styled as the player head if desired.
                -->
                <div class="scrubber"></div>
                
                <!--
                        This element will display the current time of the
                        audio as well as the total time in the corresponding
                        divs. Nothing outside of the content of those elements
                        will change so anything else can be added here.
                -->
                <div class="timeBar">
                        <div class="currentTime"></div>
                        <div class="totalTime"></div>
                </div>
                
                <!--
                        This element will display the track title, artist and 
                        album if they are provided.
                -->
                <div class="audioTitle"></div>

                <!--
                        Displays a different message when audio is playing or
                        when it isn't.
                -->
                <div class="streamMsg"></div>
                
                <!--
                        The actual audio file you want played. Note that not all
                        filetypes are compatible with every browser.
                -->
                <audio preload="metadata">
                        <source src="PATH_TO_FILE" type="FILE_TYPE" />
                </audio>
        </div>

Note that the actual audio element is optional and you can instead provide the
audio file(s) you want the player to play via the settings object.

### Javascript

Simply initialize the player like so:

        <script>
        var player = new ThumbsPlayer({
                selector: '#player'
        });
        </script>
        
If you want to leave out the audio tag:

        <script>
        var player = new ThumbsPlayer({
                selector: '#player',
                audio: [
                        { file: 'PATH_TO_FILE', type: 'FILE_TYPE' }
                ]
        });
        </script>

The settings you can pass are as follows:

#### Required:

**selector**: String selector that the player lives in

#### Optional:

**audio**: Array of audio files with *file* and *type* properties. You can also 
provide an optional **trackInfo* property which can have three properties named 
**title**, **artis** and **album** (all three are optional).

**messages**: Customize the streaming/paused messages

**logging**: Turn debug logging on/off (default is off)

**initVolume**: Initial volume, from 0.0 to 1.0 (default is 0.8)

**autoPlay**: If the audio should play immediately (default is false)

Why Do I Have To Build The HTML Myself?
---------------------------

The main reason is control. ThumbsPlayer was built with the idea that the 
audio player's look and feel could vary from page to page, which makes a player 
that always looks the same (or can be reskinned to look slightly different) a 
little less viable.

So thumbsPlayer uses a flexible system based on finding DOM elements within 
a specified container and modifying them only when needed. The script doesn't 
care what the player looks like, which allows designers to make whatever sort 
of crazy audio player they want and front-end developers can just make a neat 
looking thing with CSS.

Plugins
-------

Thanks to the magic of Javascript, building a plugin is as easy as making 
a prototype:

        ThumbsPlayer.prototype.pluginName = function(){
                
                // Put whatever cool stuff you want here
        }
        
Then just include the plugin file and add the following javascript when you
initialize the player:

        <script>
        // initialize player
        var player = new ThumbsPlayer({
                selector: '#player'
        });

        // initialize plugin
        player.pluginName();
        </script>

There are currently two plugins:

**Popout**: Allows you to add a clickable button that makes a popout player
spawn it its own window. It preserves the state of the player as well. Setup is
in the comments of the uncompressed version. This an optional argument that 
defines popup settings.

**Scrollover**: Animates a string of text from side to side if the string
can't fit inside the player. Animation is similar to most compact audio players
when displaying a lengthy song title or something like that. Minified version is
included. Setup is in the comments of the uncompressed version.

Examples
--------

The examples folder contains a few examples on how to build the player.

Examples use the wonderful album <a href="http://goto80.com/blog/goto80-the-uwe-schenk-band-the-ferret-show-mp3-upitup"><i>The Ferret Show</i> 
by Goto80 &amp; The Uwe Schenk Band</a> which was released into the public domain 
by the authors. To make the examples work you can <a href="http://www.upitup.com/catalogue/release.php?cat_id=64">download the tracks</a> 
and extract them to the extras folder.

#### Example 1

Basic player with one audio file and everything in the DOM.

#### Example 2

Similar to example 1 but defines the audio in the setup object for the player (no 
audio tag). Also uses the scrollover plugin.

#### Example 3

Similar to example 2 but with the popout plugin.

#### Example 4

An example of how to create a multi-track playlist and a player with track
navigation buttons.

To Do List
-----------

* Some revision on the actual structure of the player: better encapsulation etc

* Expose less of the player to plugins and build a more real-ish plugin system

* Build scripts for combining and minifying everything

* Better error handling for various cases: missing audio, incorrectly initialized 
player etc
