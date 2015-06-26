/*********************************************************
                        SSlider
    Author: Kadymov Alexander (alkadymov@gmail.com)
*********************************************************/

;(function ($, window, document, undefined) {
    'use strict';
    
    var pluginName = "sslider",
        defaults = {
            images : [],
            animationSpeed: 300,
            afterSlideChange : function (index, imgUrl) {},
            swipeDurationThreshold : 200,
            swipeDistanceThreshold : 30
        };

    function Plugin(element, options) {
        this.element = element;

        options = Array.isArray(options) ? {images : options} : options;
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    $.extend(Plugin.prototype, {
        
        // Initialization
        init: function() {
            var $container = $('<div class="ss-slider-container" style="position: relative; overflow: hidden;" />'),
                $trolley = $('<div class="ss-slider-trolley" style="position: absolute; height: 100%; left: 0;" />')
                    .appendTo($container),
                trolleyStyle = $trolley[0].style;
            
            this._elements = {
                $container : $container,
                $trolley : $trolley
            };
            
            this._currentSlideId = 0;
            this._slides = [];
            this._createSlides();
            
            this._resize();
            
            this._loadImage(this.options.images[0], this._slides[0]);
            
            // *** Events ***
            
            var startTouch,
                dragging = false,
                startX,
                startY,
                startPos,
                isDirChecked = false;
            
            $container.on('vmousedown', (function (e) {
                this._startDrag();
                
                startTouch = new Date();
                startX = e.pageX;
                startY = e.pageY;
                dragging = true;
                startPos = parseInt($trolley.css('left'), 10);
                isDirChecked = false;
            }).bind(this));
            
            $container.on('vmousemove', (function(e) {
                if (dragging) {
                    if (!isDirChecked) {
                        if (Math.abs(startX - e.pageX) < Math.abs(startY - e.pageY)) {
                            dragging = false;
                            return;
                        } else {
                            isDirChecked = true;
                        }
                    }
                    
                    e.preventDefault();
                    this._drag(startPos, startX - e.pageX, trolleyStyle);
                }
            }).bind(this));
            
            $container.on('vmouseup', (function(e) {
                if (!dragging) return;
                dragging = false;
                this._endDrag(startX - e.pageX);
            }).bind(this));
            
            $(window).on('resize', this._resize.bind(this));
            $(window).on('orientationchange', this._resize.bind(this));
            
            $(this.element).append($container);
        },
        
        /************************* Public section ****************************/
        
        load : function (imgArr) {
            this.options.images = imgArr;
            this._createSlides();
            this._loadImage(this.options.images[0], this._slides[0]);
        },
        
        next : function () {
            this._setActSlidesPos(true);
            this._goto(1);
        },
        
        prev : function () {
            this._setActSlidesPos(true);
            this._goto(-1);
        },
        
        /************************* Private section ***************************/
        
        _goto : function (dir) {
            var slideWidth = this._elements.$container.width(),
                left = -slideWidth,
                
                id = this._currentSlideId,
                slides = this._slides,
                nextId = id + 1 >= slides.length ? 0 : id + 1,
                prevId = id - 1 < 0 ? slides.length - 1 : id - 1,
                currentId = id;
                        
            if (dir < 0) {
                left = 0;
                currentId = this._currentSlideId = prevId;
            } else if (dir > 0) {
                left = -slideWidth * 2;
                currentId = this._currentSlideId = nextId;
            }            
            
            if (!slides[currentId].is('.loaded')) {
                this._loadImage(this.options.images[currentId], slides[currentId]);
            }
            
            this._elements.$trolley.animate({'left': left}, this.options.animationSpeed, null, (function() {
                slides[prevId].hide();
                slides[nextId].hide();
                slides[id].hide();
                slides[this._currentSlideId].show();
            }).bind(this));
            
            this.options.afterSlideChange(currentId, this.options.images[currentId]);
        },
                
        _createSlides : function () {
            var $trolley = this._elements.$trolley,
                slides = this._slides = [],
                slideHtml = '<div class="ss-slider-slide" style="position: absolute; display: none;"><i class="ss-loader"></i></div>',
                $slide;
            
            $trolley.empty();
            
            for (var i = 0, len = this.options.images.length; i < len; i++) {
                $slide = $(slideHtml).appendTo($trolley);
                slides.push($slide);
            }
        },

        _resize : function() {
            var sliderWidth = $(this.element).width(),
                screenHeight = $(window).height(),
                sEl = this._elements;
            
            sEl.$container.css('height', screenHeight);
            
            sEl.$trolley.css({
                'width' : sliderWidth * 3, 
                'left' : -sliderWidth
            });

            this._slides.forEach(function($el) {
                $el.css({
                    'width' : sliderWidth,
                    'height' : '100%'
                });
            });
            
            this._setActSlidesPos();
        },
        
        _loadImage : function (imageUrl, $slide) {
            var img = new Image();
            
            img.onload = function() {
                $slide.addClass('loaded').empty().append(img);
                $(img).fadeIn(300);
            };
            
            img.className = 'ss-slider-image';
            img.style.display = 'none';
            img.ondragstart = 'return false;';
            img.src = imageUrl;
            
            return img;
        },
        
        _setActSlidesPos : function(showActSlides) {
            var id = this._currentSlideId,
                slides = this._slides,
                nextId = id + 1 >= slides.length ? 0 : id + 1,
                prevId = id - 1 < 0 ? slides.length - 1 : id - 1,
                slideWidth = this._elements.$container.width();
                
            this._elements.$trolley.stop();
            this._elements.$trolley.css('left', -slideWidth);
            
            slides[id].css({
                'left' : slideWidth,
                'display' : 'block'
            });
            
            slides[nextId].css({
                'left' : slideWidth * 2,
                'display' : showActSlides ? 'block' : 'none'
            });
            
            slides[prevId].css({
                'left' : 0,
                'display' : showActSlides ? 'block' : 'none'
            });
        },
        
        _startDrag : function() {
            this._setActSlidesPos(true);
            this._startDragTime = new Date();
        },
        
        _drag : function(startPos, dx, trolleyStyle) {
            trolleyStyle.left = (startPos - dx) + 'px';
        },
        
        _endDrag : function(dx) { 
            var slideWidth = this._elements.$container.width(),                
                duration = (new Date()) - this._startDragTime;
            
            if ((Math.abs(dx) > slideWidth / 2) || 
                (duration < this.options.swipeDurationThreshold && Math.abs(dx) > this.options.swipeDistanceThreshold)) {
                    this._goto(dx);
            } else {
                this._goto(0);
            }
        }
    });

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName,
                new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);