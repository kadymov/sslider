/*********************************************************
                        SSlider
    Author: Kadymov Alexander (alkadymov@gmail.com)
*********************************************************/

;(function ($, window, document, undefined) {

    var pluginName = "sslider",
        defaults = {
            images : [],
            animationSpeed: 800,
            delay: 4000            
        };

    function Plugin(element, options) {
        this.element = element;

        options = Array.isArray(options) ? {images : options} : options
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function() {
            var $container = $('<div class="ss-slider-container" style="position: relative; overflow: hidden;" />'),
                $trolley = $('<div class="ss-slider-trolley" style="position: absolute; height: 100%; left: 0;" />')
                    .appendTo($container);
            
            this._elements = {
                $container : $container,
                $trolley : $trolley
            };
            
            this._currentSlideId = 0;
            this._slides = [];
            this._createSlides();
            
            this._resize();
            
            // *** Events ***
            
            var startTouch,
                dragging = false,
                startX,
                startPos;
            
            $(document).on('vmousedown', $container, (function(e) {
                this._startDrag();
                
                startTouch = new Date();
                startX = e.pageX;
                dragging = true;
                startPos = parseInt($trolley.css('left'), 10);
                
                
            }).bind(this));
            
            $(document).on('vmousemove', $container, (function(e) { //TODO
                if (dragging) {
                    this._drag(startPos, startX - e.pageX);
                }
            }).bind(this));
            
            $(document).on('vmouseup', $container, (function(e) {
                dragging = false;
                this._endDrag(startX - e.pageX);
            }).bind(this));
            
            $(window).on('resize', this._resize.bind(this));
            
            $(this.element).append($container);
        },
        
        _createSlides : function() {
            var $trolley = this._elements.$trolley,
                slides = this._slides = [],
                slideHtml = '<div class="ss-slider-slide" style="position: absolute;" />',
                $slide;
            
            $trolley.empty();
            
            for (var i = 0, len = this.options.images.length; i < len; i++) {
                $slide = $(slideHtml).appendTo($trolley).text(i);
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
        },
        
        _loadImage(imageUrl, $slide) {
            var img = new Image();
            
            img.onload = function() {
                $slide.append(img);
            };
            
            img.src = imageUrl;
            
            return img;
        },
        
        _startDrag : function() {
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
                'display' : 'block'
            });
            
            slides[prevId].css({
                'left' : 0,
                'display' : 'block'
            });
        },
        
        _drag : function(startPos, dx) {
            this._elements.$trolley.css('left', startPos - dx);
        },
        
        _endDrag : function(dx) { 
            var slideWidth = this._elements.$container.width(),
                left = -slideWidth,
                
                id = this._currentSlideId,
                slides = this._slides;
            
            if (Math.abs(dx) > slideWidth / 2) {
                if (dx < 0) {
                    left = 0;
                    this._currentSlideId = id - 1 < 0 ? slides.length - 1 : id - 1;
                } else {
                    left = -slideWidth * 2;
                    this._currentSlideId = id + 1 >= slides.length ? 0 : id + 1;
                }
            }
            
            this._elements.$trolley.animate({'left': left}, 300, null, function() {
                
            });
            
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