/*

 thumbsPlayer Popout Plugin - v1.0.1
 
 Build like so:
 
 <div class="popoutPlayer" rel="<popout player URL>">
        Click Here To Pop Out
 </div>
 
 (You can put whatever you like in the popoutPlayer div.)
 
 The rel attribute of the div is the actual URL that will be opened
 in the popup window. If the current player is active or not at time 0
 it will append a hash to it (similar to #0:10|playing) so keep that
 in mind.
 
 When you initialize the popout plugin you can pass it an optional 
 settings object:
 
 player.popout({
       width: 425,
       height: 300
 });
 
 Settings include:
        width - (integer) Popup window's width
        height - (integer) Popup window's height
        resizable - (yes/no string) If popup window can be resized
        menubar - (yes/no string) If the popup window has a menubar
        titlebar - (yes/no string) If the popup window has a titlebar
        toolbar - (yes/no string) If the popup window has a toolbar
        scrollbars - (yes/no string) - If the popup window has scrollbars

*/

ThumbsPlayer.prototype.popout = function(settings){
        
        var width       = 320,
            height      = 450,
            resizable   = 'no',
            menubar     = 'no',
            titlebar    = 'no',
            toolbar     = 'no',
            scrollbars  = 'no',
            
            target      = '_blank', 
        
        poppin = function(url, player){
                
                var urlSlug = [];
                if(player.getTrack().currentTime) {
                        urlSlug.push(player.meaningfulTime(player.getTrack().currentTime));
                }
                if(player.playing) {
                        urlSlug.push('playing');
                        player.pauseAudio();
                }
                
                if(urlSlug.length) {
                        url += '#' + urlSlug.join('|');
                }
                
                window.open(
                        url,
                        target,
                        'width=' + width +
                        ',height=' + height +
                        ',resizable=' + resizable +
                        ',menubar=' + menubar +
                        ',titlebar=' + titlebar +
                        ',toolbar=' + toolbar +
                        ',scrollbars=' + scrollbars
                );
        }, 
        
        init = (function(self, settings){
                
                if(settings) {
                        if(settings.width) width = settings.width;
                        if(settings.height) height = settings.height;
                        if(settings.resizable) resizable = settings.resizable;
                        if(settings.menubar) menubar = settings.menubar;
                        if(settings.titlebar) titlebar = settings.titlebar;
                        if(settings.toolbar) toolbar = settings.toolbar;
                        if(settings.scrollbars) scrollbars = settings.scrollbars;
                }
                
                var popoutClick = self.el.find('.popoutPlayer');
                popoutClick.click(function(){
                        poppin(popoutClick.attr('rel'), self);
                });
                
        })(this, settings);
};
