/*
 
 thumbsPlayer - v1.0.8
 
 Setting up a ThumbsPlayer in HTML (all elements are optional):
 
        class: controlSingle - single button for pause/play
                When audio is playing the button will have the class 'pause' and
                when it's not playing it will have the class 'play' (designating
                what the button should look like).
                
        class: scrubber - single (empty) item that will act as the scrubber
                Will have an empty div appended into it which will change width
                (based on the parent) depending on the position of the audio. A
                span will be appended into that div which can be styled as the
                player head if you wish
        
        class: timeBar - element that contains the current/total times
                children:
                        class: currentTime - Displays the current time
                        class: totalTime - Displays the total time

        class: streamMsg - Displays different text when the episode is streaming

        class: audioTitle - Displays track title, artist and album, if speficied
        
        class: volumeUp - Increases volume on step when clicked
        
        class: volumeDown - Decreases volume one step when clicked
        
        class: trackAhead - Switches to the next track
                Will have the class 'disabled' if there is no next track
        
        class: trackBack - Switches to the previous track
                Will have the class 'disabled' if there is no previous track

Javascript setup: create a new ThumbsPlayer object and pass it a settings object:

        var player = new ThumbsPlayer({
                selector: '#player'
        });
        
Supported settings:
        
        Required:
        selector: String selector that the player lives in
        
        Optional:
        messages: Customize the streaming/paused messages
        logging: Turn debug logging on/off (default is off)
        initVolume: Initial volume, from 0.0 to 1.0 (default is 0.8)
        autoPlay: If the audio should play immediately (default is false)
 
*/

(function(root, $, name){

        root[name] = function(settings) {
                
                var playlist = [], 
                    playerInt = null, 
                    drawScrubber = false, 
                    playable = false, 
                    volume = 0.8;

                var messages = {
                        streaming: 'Currently streaming...',
                        paused: 'Click play to stream.'
                };
                
                this.el = null;
                this.playing = false;
                this.flash = null;

                this.currentTrack = 0;
                
                var buttons = {
                        play: null,
                        pause: null, 
                        playPause: null, 
                        scrubber: null,
                        timeBar: null,
                        streamMsg: null,
                        trackTitle: null,
                        volumeUp: null,
                        volumeDown: null,
                        volume: null,
                        trackAhead: null,
                        trackBack: null
                };

                // debugging
                this.enableLog = false;
                this.log = function() {
                        if(typeof console !== 'undefined' && this.enableLog) {
                                console.log(arguments);
                        }
                };
                
                this.setTimer = function(){
                        var audio = this.getTrack();
                        if(drawScrubber) {
                                buttons.timeBar.children('.currentTime').html(this.meaningfulTime(audio.currentTime));
                                buttons.timeBar.children('.totalTime').html(this.meaningfulTime(audio.duration));
                        }
                };
                
                this.playAudio = function(){
                        this.playing = true;
                        this.updateMsg();
                        this.el.css({
                                '-webkit-animation-play-state': 'running', 
                                '-moz-animation-play-state': 'running',
                                '-ms-animation-play-state': 'running',
                                '-o-animation-play-state': 'running'
                        });
                        
                        this.getTrack().play();
                        this.setVolume(volume);
                };
                
                this.pauseAudio = function(){
                        this.playing = false;
                        this.updateMsg();
                        this.el.css({
                                '-webkit-animation-play-state': 'paused',
                                '-moz-animation-play-state': 'paused',
                                '-ms-animation-play-state': 'paused', 
                                '-o-animation-play-state': 'paused'
                                
                        });
                        this.getTrack().pause();
                };
                
                this.playOrPauseAudio = function(){
                        if(this.playing) {
                                this.pauseAudio();
                        } else {
                                this.playAudio();
                        }
                };
                
                this.updateMsg = function(){
                        if(buttons.streamMsg) {
                                if(this.playing) {
                                        buttons.streamMsg.html(messages.streaming);
                                } else {
                                        buttons.streamMsg.html(messages.paused);
                                }
                        }
                };

                this.updateTitle = function() {
                        var audio = this.getTrack(), 
                            fullTitle = [];
                        if(buttons.trackTitle && typeof audio.trackInfo != 'undefined') {
                                if(typeof audio.trackInfo.artist != 'undefined') {
                                        fullTitle.push(audio.trackInfo.artist);
                                }
                                if(typeof audio.trackInfo.title != 'undefined') {
                                        fullTitle.push('"' + audio.trackInfo.title + '"');
                                }
                                if(typeof audio.trackInfo.album != 'undefined') {
                                        fullTitle.push('<i>' + audio.trackInfo.album + '</i>');
                                }

                                buttons.trackTitle.html(fullTitle.join(' - '));
                        }
                };
                
                this.scrub = function(e){
                        var scrubPos = buttons.scrubber.offset(), requestedTime;
                        var audioPosition = Math.floor(((e.pageX - scrubPos.left) / buttons.scrubber.width()) * 100);
                        
                        if(audioPosition > 100) audioPosition = 100;
                        else if(audioPosition < 0) audioPosition = 0;
                        
                        buttons.scrubber.children('div').css({ width: audioPosition + '%' });
                        requestedTime = Math.floor(audio.duration * (audioPosition / 100));
                        this.setCurrentTimer(requestedTime);
                        
                        return requestedTime;
                };
                
                this.seekAudio = function(position){
                        var audio = this.getTrack();
                        if(position > audio.duration) {
                                position = audio.duration;
                        } else if(position < 0) {
                                position = 0;
                        }

                        if(typeof audio.seek === 'function') {
                            audio.seek(position);
                        } else {
                            audio.currentTime = position;
                        }
                        drawScrubber = true;
                };
                
                this.checkBuffering = function(){
                        if(!buttons.playPause) {
                                return;
                        }

                        var audio = this.getTrack();
                        if(this.playing && (audio.buffered.start(0) >= audio.currentTime || audio.buffered.end(0) <= audio.currentTime)) {
                                buttons.playPause.removeClass('play').removeClass('pause');
                        } else {
                                if(this.playing) {
                                        buttons.playPause.removeClass('play').addClass('pause');
                                } else {
                                        buttons.playPause.addClass('play').removeClass('pause');
                                }
                        }
                };
                
                this.updateScrubber = function(){
                        var audio = this.getTrack();
                        if(drawScrubber) {
                                var audioPct = Math.floor((audio.currentTime / audio.duration) * 100);
                                buttons.scrubber.children('div').css({ width: audioPct + '%' });
                        }
                };
                
                this.setCurrentTimer = function(seconds){
                        buttons.timeBar.children('.currentTime').html(this.meaningfulTime(seconds));
                };
                
                this.meaningfulTime = function(totalTime){
                        var hours = 0, minutes = 0, seconds = 0;
                        if(totalTime > 0) seconds = Math.round(totalTime % 60);
                        if(totalTime >= 60) minutes = Math.floor((totalTime / 60) % 60);
                        if(totalTime >= 3600) hours = Math.floor((totalTime / 3600) % 3600);
                        
                        if(seconds < 10) seconds = '0' + seconds;
                        if(minutes < 10) minutes = '0' + minutes;
                        
                        return hours + ':' + minutes + ':' + seconds;
                };
                
                this.meaningfulToSeconds = function(timeString){
                        var timeSections = timeString.split(':').reverse(),
                            seconds = 0;
                        for(var i = 0; i < timeSections.length; i++) {
                                if(i === 0) seconds += parseInt(timeSections[i]);
                                else if(i == 1) seconds += parseInt(timeSections[i]) * 60;
                                else if(i == 2) seconds += parseInt(timeSections[i]) * 3600;
                        }
                        
                        return seconds;
                };

                this.adjustVolume = function(volume) {
                        return (Math.exp(volume) - 1) / (Math.E - 1);
                };
                
                this.setVolume = function(newVolume) {
                        if(newVolume > 1.0) {
                                newVolume = 1.0;
                        } else if(newVolume < 0.0) {
                                newVolume = 0.0;
                        }
                        
                        this.log('volume: ' + newVolume);
                        
                        volume = newVolume;
                        if(this.playing) {
                                this.getTrack().volume = this.adjustVolume(newVolume);
                                this.log('real volume: ' + this.getTrack().volume);
                                if(typeof this.getTrack().setVolume === 'function') {
                                        this.getTrack().setVolume();
                                }
                        }
                };
                
                this.stepVolume = function(direction) {
                        var step = 0.1 * direction;
                        this.setVolume(volume + step);
                };
                
                this.changeTrack = function(trackId) {
                        if(typeof playlist[trackId] !== 'undefined') {
                                if(this.playing) {
                                        // reset the current track
                                        this.pauseAudio();
                                        this.seekAudio(0);
                                        
                                        // set up the new one
                                        this.currentTrack = trackId;
                                        this.seekAudio(0);
                                        this.playAudio();
                                } else {
                                        this.playAudio();
                                }
                                
                                this.setTrackButtons();
                                this.updateTitle();
                        }
                };

                this.getTrack = function() {
                        return playlist[this.currentTrack];
                };
                
                this.setTrackButtons = function() {
                        if(buttons.trackAhead) {
                                if(this.currentTrack >= playlist.length - 1) {
                                                buttons.trackAhead.addClass('disabled');
                                } else {
                                        buttons.trackAhead.removeClass('disabled');
                                }
                        }
                        
                        if(buttons.trackBack) {
                                if(this.currentTrack <= 0) {
                                        buttons.trackBack.addClass('disabled');
                                } else {
                                        buttons.trackBack.removeClass('disabled');
                                }
                        }
                };
                
                this.jPlayerLoaded = false;
                
                this.jPlayerBridge = function(originalAudio, player) {

                        var self = this,
                            hasFlash = false,
                            audio = $(originalAudio).children('source');
                        
                        this.src = audio.attr('src');
                        this.runtime = audio.data('runtime');
                        this.player = $('<div />').addClass('jplayer');
                        
                        this.duration = this.runtime ? this.runtime : 0;
                        this.currentTime = 0;
                        this.bufferedStart = 0;
                        this.bufferedEnd = 0;

                        $(player.el).append(this.player);

                        this.player.jPlayer({
                                ready: function() {
                                        self.init();
                                        player.addListeners(self);
                                },
                                swfPath: "../player/jplayer/jplayer.swf",
                                solution: "html, flash"
                        });
                        
                        this.addEventListener = function(event, callback) {
                            self.player.bind($.jPlayer.event[event], callback);
                        };
                        
                        this.init = function(){
                                hasFlash = true;
                                
                                self.addEventListener('timeupdate', function(event) {
                                        self.currentTime = event.jPlayer.status.currentTime;
                                });
                                
                                self.addEventListener('progress', function(event) {
                                        if(!self.runtime || (event.jPlayer.status.duration > self.duration)) {
                                                self.duration = event.jPlayer.status.duration;
                                        }
                                        self.bufferedEnd = event.jPlayer.status.duration;
                                });
                                
                                self.player.jPlayer('setMedia', {
                                        mp3: self.src
                                });
                        };
                        
                        this.play = function(time) {
                                if(!hasFlash) {
                                        return false;
                                }
                                self.player.jPlayer('play', time);
                                return true;
                        };

                        this.pause = function(time) {
                                if(typeof time !== 'undefined') {
                                        self.player.jPlayer('pause', time);
                                } else {
                                        self.player.jPlayer('pause');
                                }
                        };
                        
                        this.seek = function(seconds) {
                                if(!player.playing) {
                                        self.pause(seconds);
                                } else {
                                        self.play(seconds);
                                }
                        };
                        
                        this.buffered = {
                                start: function(i) {
                                        return self.bufferedStart;
                                },
                                end: function(i) {
                                        return self.bufferedEnd;
                                }
                        };

                        this.volume = null;

                        this.setVolume = function(volume) {
                                self.player.jPlayer('volume', this.volume);
                        };
                };
                
                this.addListeners = function(audio) {
                        var self = this;
                        
                        audio.addEventListener('durationchange', function(){
                                self.setTimer();
                        });
                        
                        audio.addEventListener('timeupdate', function(){
                                self.setTimer();
                                self.updateScrubber();
                        });
                        
                        audio.addEventListener('play', function(){
                                self.log('play');
                                buttons.playPause.addClass('play').removeClass('pause');
                        });
                        
                        audio.addEventListener('pause', function(){
                                self.log('pause');
                                buttons.playPause.removeClass('pause').addClass('play');
                        });
                        
                        audio.addEventListener('ended', function(){
                                self.pauseAudio();
                        });
                        
                        audio.addEventListener('loadedmetadata', function(){
                                if(window.location.hash) {
                                        var urlSlugs = window.location.hash.substr(1).split('|'), play = false;
                                        for(var i = 0; i < urlSlugs.length; i++) {
                                                if(urlSlugs[i] == 'playing') {
                                                        play = true;
                                                } else {
                                                        seconds = self.meaningfulToSeconds(urlSlugs[i]);
                                                        self.seekAudio(seconds);
                                                }
                                        }
                                        
                                        if(play) {
                                                self.playAudio();
                                        }
                                }
                        });
                };

                this.applySettings = function(settings) {
                        this.el = $(settings.selector);
                        
                        if(!this.el.length) {
                                return false;
                        }
                        
                        if(typeof settings.logging !== 'undefined') {
                                this.enableLog = settings.logging;
                        }
                        
                        if(typeof settings.messages !== 'undefined') {
                                for(var msgName in settings.messages) {
                                        if(!settings.messages.hasOwnProperty(msgName)) {
                                                continue;
                                        }
                                        messages[msgName] = messages[msgName];
                                }
                        }

                        if(typeof settings.initVolume !== 'undefined') {
                                this.volume = settings.initVolume;
                        }

                        var i;
                        if(this.el.find('audio').length) {
                                playlist = this.el.find('audio');
                        } else if(typeof settings.audio != 'undefined' && settings.audio.length) {
                                for(i = 0; i < settings.audio.length; i++) {
                                        var a = new Audio();
                                        a.src = settings.audio[i].file;

                                        if(typeof settings.audio[i].type != 'undefined') {
                                                a.type = settings.audio[i].type;
                                        }
                                        if(typeof settings.audio[i].trackInfo != 'undefined') {
                                                a.trackInfo = settings.audio[i].trackInfo;
                                        }

                                        a.load();
                                        playlist.push(a);
                                }
                        } else {
                                // no audio to play!
                        }

                        var playable;
                        for(i = 0; i < playlist.length; i++) {

                                playable = playlist[i].canPlayType(playlist[i].type);

                                if(playable == 'maybe' || playable == 'probably') {
                                        this.addListeners(playlist[i]);
                                } else {
                                        var p = new this.jPlayerBridge(playlist[i], this);
                                        playlist[i] = p;
                                }
                        }

                        return true;
                };
                
                // initialization for the player
                (function(settings, self){
                        
                        if(!self.applySettings(settings)) {
                                // player element not found
                                return;
                        }

                        self.currentTrack = 0;
                        
                        if(self.el.find('.controlSingle').length) {
                                
                                buttons.playPause = self.el.find('.controlSingle');
                                buttons.playPause.addClass('play');
                                buttons.playPause.click(function(){
                                        self.playOrPauseAudio(self);
                                        return false;
                                });
                        }
                        
                        if(self.el.find('.scrubber').length) {
                                
                                buttons.scrubber = self.el.find('.scrubber');
                                var progress = $('<div />')
                                        .css({ width: '0%' })
                                        .appendTo(buttons.scrubber);
                                        
                                $('<span />')
                                        .appendTo(progress);
                                
                                drawScrubber = true;
                                
                                var scrubTo = 0;
                                buttons.scrubber.bind('mousedown', function(e){
                                        self.log('scrub: click');
                                        
                                        drawScrubber = false;
                                        scrubTo = self.scrub(e);
                                        
                                        buttons.scrubber.bind('mousemove', function(e){
                                                self.log('scrub: scrub scrub');
                                                scrubTo = self.scrub(e);
                                        });
                                        
                                        buttons.scrubber.bind('mouseleave', function(){
                                                self.log('scrub: leave (play)');
                                                self.seekAudio(scrubTo);
                                                buttons.scrubber
                                                        .unbind('mousemove')
                                                        .unbind('mouseleave')
                                                        .unbind('mouseup');
                                        });
                                        
                                        buttons.scrubber.bind('mouseup', function(){
                                                self.log('scrub: let go (play)');
                                                self.seekAudio(scrubTo);
                                                buttons.scrubber
                                                        .unbind('mousemove')
                                                        .unbind('mouseleave')
                                                        .unbind('mouseup');
                                        });
                                });
                        }
                        
                        if(self.el.find('.timeBar').length) {
                                buttons.timeBar = self.el.find('.timeBar');
                        }
                                
                        if(self.el.find('.streamMsg').length) {
                                buttons.streamMsg = self.el.find('.streamMsg');
                                self.updateMsg();
                        }
                        
                        if(self.el.find('.volumeUp').length) {
                                buttons.volumeUp = self.el.find('.volumeUp');
                                buttons.volumeUp.bind('click', function(){
                                        self.log('click: volume up');
                                        self.stepVolume(1);
                                });
                        }
                        
                        if(self.el.find('.volumeDown').length) {
                                buttons.volumeDown = self.el.find('.volumeDown');
                                buttons.volumeDown.bind('click', function(){
                                        self.log('click: volume down');
                                        self.stepVolume(-1);
                                });
                        }
                        
                        if(self.el.find('.trackAhead').length) {
                                buttons.trackAhead = self.el.find('.trackAhead');
                                buttons.trackAhead.bind('click', function(){
                                        self.log('click: skip track');
                                        self.changeTrack(self.currentTrack + 1);
                                });
                        }
                        
                        if(self.el.find('.trackBack').length) {
                                buttons.trackBack = self.el.find('.trackBack');
                                buttons.trackBack.bind('click', function(){
                                        self.log('click: back track');
                                        self.changeTrack(self.currentTrack - 1);
                                });
                        }

                        if(self.el.find('.audioTitle').length) {
                                buttons.trackTitle = self.el.find('.audioTitle');
                                self.updateTitle();
                        }
                        
                        if(self.el.find('.volume').length) {
                                buttons.volume = self.el.find('.volume');
                        }
                        
                        self.playerInt = setInterval(function(){
                                self.checkBuffering();
                        }, 100);
                        
                        self.setTrackButtons();
                        
                        if(typeof settings.autoPlay != 'undefined' && settings.autoPlay) {
                                self.playAudio();
                        }
                
                })(settings, this);
        };

})(this, jQuery, 'ThumbsPlayer');
