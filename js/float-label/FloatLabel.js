"use strict";

;(function ($, window, document, undefined) {

    /*
     Store the name of the plugin in the "pluginName" variable. This
     variable is used in the "Plugin" constructor below, as well as the
     plugin wrapper to construct the key for the "$.data" method.

     More: http://api.jquery.com/jquery.data/
     */
    var pluginName = 'FloatLabel';

    //region function: getPluginDataName(string)
    /**
     * @param {String} [string]
     * @return {String}
     */
    function getPluginDataName(string) {
        return "plugin_" + (string || pluginName);
    }

    //endregion

    //region FloatLabel

    //region constructor: Plugin
    /*
     The "Plugin" constructor, builds a new instance of the plugin for the
     DOM node(s) that the plugin is called on. For example,
     "$('h1').pluginName();" creates a new instance of pluginName for
     all h1's.
     */
    // Create the plugin constructor
    function Plugin(element, options) {
        /*
         Provide local access to the DOM node(s) that called the plugin,
         as well local access to the plugin name and default options.
         */
        this.element = element;
        this._name = pluginName;
        this._defaults = $.fn[this._name].defaults;
        /*
         The "$.extend" method merges the contents of two or more objects,
         and stores the result in the first object. The first object is
         empty so that we don't alter the default options for future
         instances of the plugin.

         More: http://api.jquery.com/jquery.extend/
         */
        this.options = $.extend({}, this._defaults, options);

        /*
         The "init" method is the starting point for all plugin logic.
         Calling the init method here in the "Plugin" constructor function
         allows us to store all methods (including the init method) in the
         plugin's prototype. Storing methods required by the plugin in its
         prototype lowers the memory footprint, as each instance of the
         plugin does not need to duplicate all of the same methods. Rather,
         each instance can inherit the methods from the constructor
         function's prototype.
         */
        this.init();
    }

    //endregion

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {

        /**
         * @type {null|String}
         */
        _paddingTopCache: null,

        /**
         * @type {boolean}
         */
        animating: false,

        /**
         * @type {null|jQuery}
         */
        $element: null,

        /**
         * @type {null|jQuery}
         */
        $input: null,

        /**
         * @type {null|jQuery}
         */
        $label: null,

        /**
         * @type {null|{focusedClass:String, populatedClass:String}}
         */
        options: null,

        //region init: Initialization logic
        init: function () {
            /*
             Create additional methods below and call them via
             "this.myFunction(arg1, arg2)", ie: "this.buildCache();".

             Note, you can cccess the DOM node(s), plugin name, default
             plugin options and custom plugin options for a each instance
             of the plugin by using the variables "this.element",
             "this._name", "this._defaults" and "this.options" created in
             the "Plugin" constructor function (as shown in the buildCache
             method below).
             */
            this.buildCache();
            this.bindEvents();
        },
        //endregion

        //region destroy: Remove plugin instance completely
        destroy: function () {
            /*
             The destroy method unbinds all events for the specific instance
             of the plugin, then removes all plugin data that was stored in
             the plugin instance using jQuery's .removeData method.

             Since we store data for each instance of the plugin in its
             instantiating element using the $.data method (as explained
             in the plugin wrapper below), we can call methods directly on
             the instance outside of the plugin initalization, ie:
             $('selector').data('plugin_myPluginName').someOtherFunction();

             Consequently, the destroy method can be called using:
             $('selector').data('plugin_myPluginName').destroy();
             */
            delete this._paddingTopCache;
            delete this.$label;
            delete this.$element;
            delete this.$input;

            this.unbindEvents();
            this.$element.removeData(getPluginDataName());
        },
        //endregion

        //region buildCache: Cache DOM nodes for performance
        buildCache: function () {
            /*
             Create variable(s) that can be accessed by other plugin
             functions. For example, "this.$element = $(this.element);"
             will cache a jQuery reference to the elementthat initialized
             the plugin. Cached variables can then be used in other methods.
             */
            this.$element = $(this.element);
            this.$input = this.$element.find('input');
            this.$label = this.$element.find('label');
        },
        //endregion

        //region function: getEventName(stringOrArray)
        /**
         *
         * @param {String|Array} stringOrArray
         * @return {String}
         */
        getEventName: function (stringOrArray) {
            if ($.isArray(stringOrArray)) {
                var result = '';
                var getEventName = $.proxy(this, 'getEventName');

                $.each(stringOrArray, function (index, value) {
                    result += ' ' + getEventName(value);
                });

                return result;
            }

            return stringOrArray + '.' + pluginName;
        },
        //endregion

        //region bindEvents() / unbindEvents() : Bind events that trigger methods
        bindEvents: function () {
            /** @type {jQuery} */
            var input = this.$input;

            this.populated(!this.isEmpty());

            input.on(this.getEventName('focus'), $.proxy(function () {
                this.animating = this.options.usingBlurAnimation;
                this.focused(true);
                this.populated(!this.isEmpty());
            }, this));

            input.on(this.getEventName(['input', 'change']), $.proxy(function () {
                this.focused(true);
                this.populated(!this.isEmpty());
            }, this));

            input.on(this.getEventName('blur'), $.proxy(function () {
                this.animating = this.options.usingBlurAnimation;
                this.focused(false);
                this.populated(!this.isEmpty());
            }, this));

            input.on(this.getEventName('keyup'), $.proxy(function () {
                this.populated(true);
            }, this));

            this.$element.on(
                this.getEventName(['webkitTransitionEnd', 'otransitionend', 'oTransitionEnd', 'msTransitionEnd', 'transitionend']),
                $.proxy(function() {
                    this.animating = false;
                    this.sync();
                }, this));
            //
            // /*
            //  Bind event(s) to handlers that trigger other functions, ie:
            //  "plugin.$element.on('click', function() {});". Note the use of
            //  the cached variable we created in the buildCache method.
            //
            //  All events are namespaced, ie:
            //  ".on('click'+'.'+this._name', function() {});".
            //  This allows us to unbind plugin-specific events using the
            //  unbindEvents method below.
            //  */
            // plugin.$element.on('click'+'.'+plugin._name, function() {
            //     /*
            //      Use the "call" method so that inside of the method being
            //      called, ie: "someOtherFunction", the "this" keyword refers
            //      to the plugin instance, not the event handler.
            //
            //      More: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
            //      */
            //     plugin.someOtherFunction.call(plugin);
            // });

            return this;
        },

        // Unbind events that trigger methods
        unbindEvents: function () {
            /*
             Unbind all events in our plugin's namespace that are attached
             to "this.$element".
             */
            this.$element.off(this.getEventName(''));

            return this;
        },
        //endregion

        sync: function () {
            this.capture();
            this.impersonate(!this.isFocused() && !this.isPopulated());
        },

        //region utility
        /**
         * @param {boolean} boolean
         */
        impersonate: function (boolean) {
            function attr(string) {
                if (!boolean) {
                    return '';
                } else {
                    if ('padding-top' === string) {
                        return this._paddingTopCache;
                    } else {
                        return this.$input.css(string);
                    }
                }
            }

            attr = $.proxy(attr, this);

            this.$label.css({
                'font-size': attr('font-size'),
                'font-weight': attr('font-weight'),
                'font-family': attr('font-family'),
                'font-style': attr('font-style'),
                'padding-left': attr('padding-left'),
                'padding-top': attr('padding-top'),
                'left': attr('margin-left'),
                'top': attr('margin-top'),
                'cursor': attr('cursor'),
                'color': attr('color')
            });

            return this;
        },

        shouldFloat: function () {
            return !(this.isEmpty() && (!this.isFocused() || !this.isPopulated() || this.isImpersonating()));
        },

        /**
         *
         * @return {Plugin}
         */
        capture: function () {
            if (this.isEmpty() && !this.isFocused() && !this.isPopulated() && !this.animating) {
                if (!this._paddingTopCache) {
                    this._paddingTopCache = this.$input.css('padding-top');

                    if ('28px' === this._paddingTopCache) {
                        debugger;
                    }
                }
            }

            return this;
        },

        /**
         * @param {boolean} boolean
         * @return {Plugin}
         */
        populated: function (boolean) {
            this.sync();
            this.$element.toggleClass(this.options.populatedClass, !!boolean);
            this.sync();

            return this;
        },

        /**
         * @param {boolean} boolean
         * @return {Plugin}
         */
        focused: function (boolean) {
            this.sync();
            this.$element.toggleClass(this.options.focusedClass, !!boolean);
            this.sync();

            return this;
        },
        //endregion

        //region function: boolean isEmpty()
        /**
         * @return {boolean}
         */
        isEmpty: function () {
            var val = this.$input.val();

            return (!val || this.$label.text() === val);
        },
        //endregion

        //region function: boolean isPopulated()
        /**
         * @return {boolean}
         */
        isPopulated: function () {
            return this.$element.hasClass(this.options.populatedClass);
        },
        //endregion

        //region function: boolean isFocused()
        /**
         * @return {boolean}
         */
        isFocused: function () {
            return this.$element.hasClass(this.options.focusedClass);
        },
        //endregion

        //region function: boolean isImpersonating()
        /**
         * @return {boolean}
         */
        isImpersonating: function () {
            return !this.isFocused();
        },
        //endregion

    });

    //endregion

    /*
     Create a lightweight plugin wrapper around the "Plugin" constructor,
     preventing against multiple instantiations.

     More: http://learn.jquery.com/plugins/basic-plugin-creation/
     */
    $.fn[pluginName] = function (options) {
        this.each(function () {
            var plugin = $.data(this, getPluginDataName());

            if (!plugin) {
                /*
                 Use "$.data" to save each instance of the plugin in case
                 the user wants to modify it. Using "$.data" in this way
                 ensures the data is removed when the DOM element(s) are
                 removed via jQuery methods, as well as when the userleaves
                 the page. It's a smart way to prevent memory leaks.

                 More: http://api.jquery.com/jquery.data/
                 */
                $.data(this, getPluginDataName(), new Plugin(this, options));
            } else {
                plugin.sync();
            }
        });

        /*
         "return this;" returns the original jQuery object. This allows
         additional jQuery methods to be chained.
         */
        return this;
    };

    //region defaults
    /*
     Attach the default plugin options directly to the plugin object. This
     allows users to override default plugin options globally, instead of
     passing the same option(s) every time the plugin is initialized.

     For example, the user could set the "property" value once for all
     instances of the plugin with
     "$.fn.pluginName.defaults.property = 'myValue';". Then, every time
     plugin is initialized, "property" will be set to "myValue".

     More: http://learn.jquery.com/plugins/advanced-plugin-concepts/
     */
    $.fn[pluginName].defaults = {
        populatedClass: 'populated',
        focusedClass: 'focused',
        usingBlurAnimation: true
    };
    //endregion

})(jQuery, window, document);