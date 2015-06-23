/*********************************************************
                        SSlider
    Author: Kadymov Alexander (alkadymov@gmail.com)
*********************************************************/

;(function ($, window, document, undefined) {

    var pluginName = "sslider",
        defaults = {
            
        };

    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {
        init: function() {

        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName,
                new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);