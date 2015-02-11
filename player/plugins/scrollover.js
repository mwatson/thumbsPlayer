/*

 thumbsPlayer Scrollover Plugin - v1.0.1
  
 The audioTitle class should have styles of:
        white-space: nowrap;
        overflow: hidden;

 A fixed width also helps but isn't necessary. If the text is wider than
 the parent element it will automatically scroll back and forth. Otherwise
 the text will stay put.

*/

ThumbsPlayer.prototype.scrollover = function(){
        
        var animateTimer = null,
            scrollContainer = null,
            scWidth = 0,
            scrollSpeed = 2500, // 100 pixels per second
            scrollDelay = 1000,
            scrollTime = 0,
            scrollOffset = 0,
        
        init = (function(self){
                
                if(!self.el.length) {
                        return;    
                }
                
                if(!self.el.find('.audioTitle').length) {
                        return;
                }

                var titleContainer = self.el.find('.audioTitle'), 
                    trackTitle = titleContainer.html();
                
                scrollContainer = $('<div />')
                                        .addClass('scrollover')
                                        .css({ display: 'inline-block' })
                                        .html(trackTitle);

                var oldWidth = titleContainer.css('width');

                titleContainer
                        .css({ width: '1000px' })
                        .html(scrollContainer);

                var scWidth = parseInt(scrollContainer.innerWidth());

                titleContainer.css({ width: oldWidth });
                scrollContainer.css({ width: scWidth + 'px' });

                if(scWidth <= parseInt(titleContainer.innerWidth())) {
                        return;
                }
                
                scrollOffset = scWidth - parseInt(titleContainer.innerWidth());
                scrollTime = scrollSpeed * (scrollOffset / 100);
                
        })(this), 
        
        animateLeft = function(){
                scrollContainer.animate({ marginLeft: -1 * scrollOffset + 'px' }, scrollTime, 'linear');
                clearTimeout(animateTimer);
                animateTimer = setTimeout(function(){
                        animateRight();
                }, scrollDelay + scrollTime);
        },
        
        animateRight = function(){
                scrollContainer.animate({ marginLeft: '0px' }, scrollTime, 'linear');
                clearTimeout(animateTimer);
                animateTimer = setTimeout(function(){
                        animateLeft();
                }, scrollDelay + scrollTime);
        },
        
        animate = (function(){
                animateLeft();
        })();
};
