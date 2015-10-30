/*
 *  jQuery Email Autocomplete - v0.0.2
 *  A jQuery plugin that suggests and autocompletes the domain in email fields.
 *  https://github.com/yzlow/email-autocomplete
 *
 *  Made by Low Yong Zhen <cephyz@gmail.com>
 *  Under MIT License < http://yzlow.mit-license.org>
 */
"use strict";

(function ($, window, document, undefined) {

    var pluginName = "emailautocomplete";
    var defaults = {
        suggClass: "eac-sugg",
        domains: ["yahoo.com" ,"hotmail.com" ,"gmail.com" ,"me.com" ,"aol.com" ,"mac.com" ,"live.com" ,"comcast.net" ,"googlemail.com" ,"msn.com" ,"hotmail.co.uk" ,"yahoo.co.uk" ,"facebook.com" ,"verizon.net" ,"sbcglobal.net" ,"att.net" ,"gmx.com" ,"outlook.com" ,"icloud.com"]
    };

    function getElementFontSize( context ) {
        // Returns a number
        return parseFloat(
            // of the computed font-size, so in px
            getComputedStyle(
                // for the given context
                context
                    // or the root <html> element
                || document.documentElement
            )
                .fontSize
        );
    }

    function convertRemToPx(value) {
        return convertEmToPx(value);
    }

    function convertPxToRem(value) {
        return convertPxToEm(value, context);
    }

    function convertEmToPx(value, context) {
        return value * getElementFontSize(context);
    }

    function convertPxToEm(value, context) {
        return value * getElementFontSize(context);
    }

    function Plugin(elem, options) {
        this.$field = $(elem);
        this.options = $.extend(true, {}, defaults, options); //we want deep extend
        this._defaults = defaults;
        this._domains = this.options.domains;
        this.init();
    }

    Plugin.prototype = {
        init: function () {

            //shim indexOf
            if (!Array.prototype.indexOf) {
                this.doIndexOf();
            }

            //wrap our field
            var $wrap = $("<div class='eac-input-wrap' />").css({
                display: this.$field.css("display"),
                position: "relative",
                fontSize: this.$field.css("fontSize")
            });
            this.$field.wrap($wrap);

            //create container to test width of current val
            this.$cval = $("<span class='eac-cval' />").css({
                visibility: "hidden",
                position: "absolute",
                display: "inline-block",
                fontFamily: this.$field.css("fontFamily"),
                fontWeight: this.$field.css("fontWeight"),
                letterSpacing: this.$field.css("letterSpacing")
            }).insertAfter(this.$field);

            //create the suggestion overlay
            /* touchstart jquery 1.7+ */
            this.$suggOverlay = $("<span class='"+this.options.suggClass+"' />").insertAfter(this.$field);
            this.syncOverlay();

            //bind events and handlers
            this.$field.on("keyup.eac", $.proxy(this.displaySuggestion, this));

            this.$field.on('blur.eac', $.proxy(function(e) {
                // Hide our suggestion.
                this.$suggOverlay.hide();
            }, this));

            this.$field.on("keydown.eac", $.proxy(function(e){
                var code = (e.keyCode || e.which);
                if(code === 39 || code === 9 || code == 13){
                    this.autocomplete();

                    if (code == 13) {
                        e.preventDefault();
                    }
                }
            }, this));

            this.$suggOverlay.on("mousedown.eac touchstart.eac", $.proxy(this.autocomplete, this));
        },

        syncOverlay: function() {
            var heightPad = this.sizeInPx('padding-top') + this.sizeInPx('border-top-width');

            this.$suggOverlay.css({
                display: "block",
                "box-sizing": "content-box", //standardize
                lineHeight: this.$field.css('lineHeight'),
                paddingTop: heightPad + "px",
                paddingBottom: heightPad + "px",
                fontFamily: this.$field.css("fontFamily"),
                fontWeight: this.$field.css("fontWeight"),
                letterSpacing: this.$field.css("letterSpacing"),
                position: "absolute",
                top: 0,
                left: 0
            });
        },

        suggest: function (str) {
            var str_arr = str.split("@");
            if (str_arr.length > 1) {
                str = str_arr.pop();
                if (!str.length) {
                    return "";
                }
            } else {
                return "";
            }

            var match = this._domains.filter(function (domain) {
                    return 0 === domain.indexOf(str);
                }).shift() || "";

            return match.replace(str, "");
        },

        autocomplete: function () {
            if(typeof this.suggestion === "undefined" || this.suggestion.length < 1){
                return false;
            }
            this.$field.val(this.val + this.suggestion);
            this.$suggOverlay.text("");
            this.$cval.text("");
        },

        /**
         * Displays the suggestion, handler for field keyup event
         */
        displaySuggestion: function (e) {
            this.val = this.$field.val();
            this.suggestion = this.suggest(this.val);

            if (!this.suggestion.length) {
                this.$suggOverlay.text("");
            } else {
                e.preventDefault();
            }

            this.$suggOverlay.show();
            //update with new suggestion
            this.$suggOverlay.text(this.suggestion);
            this.$cval.text(this.val);

            //find width of current input val so we can offset the suggestion text
            var cvalWidth = this.$cval.width();

            if(this.$field.outerWidth() > cvalWidth){
                var o = this.calculateFieldLeftOffset();
                //offset our suggestion container
                //get input padding,border and margin to offset text (might change every time)
                this.$suggOverlay.css('left', o + cvalWidth + "px");
            }
        },

        calculateFieldLeftOffset: function() {
            return this.sizeInPx('padding-left') + this.sizeInPx('margin-right') + this.sizeInPx('border-left-width');
        },

        sizeInPx: function(css) {
            // calculate the values you need, using a switch statement
            // or some other clever solution you figure out

            // this now contains a wrapped set with the element you apply the
            // function on, and direction should be one of the four strings 'top',
            // 'right', 'left' or 'bottom'

            // That means you could probably do something like (pseudo code):
            var raw = this.$field.css(css);
            var intPart = parseFloat(raw);
            var unit = raw.replace(''+intPart, '');

            return this.convertToPx(intPart, unit);
        },

        convertPxToUnits: function(valueInPx, units) {
            switch (units)
            {
                case 'px':
                    return valueInPx;
                case 'em':
                    return convertPxToEm(valueInPx, this.$field);
                case 'rem':
                    return convertPxToRem(valueInPx);
                default:
                    // Do whatever you feel good about as default action
                    // Just make sure you return a value on each code path
                    return valueInPx;
            }
        },

        convertToPx: function(valueInUnits, units) {
            switch (units)
            {
                case 'px':
                    return valueInUnits;
                case 'em':
                    return convertEmToPx(valueInUnits);
                case 'rem':
                    return convertRemToPx(valueInUnits);
                default:
                    // Do whatever you feel good about as default action
                    // Just make sure you return a value on each code path
                    return valueInUnits;
            }
        },

        /**
         * indexof polyfill
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
         */
        doIndexOf: function(){
            Array.prototype.indexOf = function (searchElement, fromIndex) {
                if ( this === undefined || this === null ) {
                    throw new TypeError( '"this" is null or not defined' );
                }

                var length = this.length >>> 0; // Hack to convert object.length to a UInt32

                fromIndex = +fromIndex || 0;

                if (Math.abs(fromIndex) === Infinity) {
                    fromIndex = 0;
                }

                if (fromIndex < 0) {
                    fromIndex += length;
                    if (fromIndex < 0) {
                        fromIndex = 0;
                    }
                }

                for (;fromIndex < length; fromIndex++) {
                    if (this[fromIndex] === searchElement) {
                        return fromIndex;
                    }
                }

                return -1;
            };
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "yz_" + pluginName)) {
                $.data(this, "yz_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);