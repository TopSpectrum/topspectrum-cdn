/**
 * This file assumes that you are running:
 *
 *  - Underscore
 *  - Backbone
 *  - Handlebars
 *  - jQuery (including all the TopSpectrum plugins)
 *
 * @type {{}}
 */
var Ts = {
    ensureFn: function(fn) {
        if (!fn) {
            return this.emptyFn;
        }

        return fn;
    },

    emptyFn: function() {

    },

    namespace : function() {

        var argsLen = arguments.length;

        for(var i = 0; i < argsLen; i++){
            var arg = arguments[i];
            if (!_.isString(arg))
                continue;

            var parts = arg.split('.');

            if (!parts) {
                return;
            }

            var partsLen = parts.length;
            var obj = window;
            for(var j = 0; j < partsLen; j++){
                var thing = obj[parts[j]];

                if (!thing) {
                    thing = obj[parts[j]] = {};
                }

                obj = thing;
            }
        }
    }
};

(function() {
    Ts.Object = function(options) {
        _.extend(this, options);
        this.initialize.apply(this, arguments);
    };


    // Attach all inheritable methods to the Model prototype.
    _.extend(Ts.Object.prototype, Backbone.Events, {

        initialize: Ts.emptyFn

    });

    // Helper function to correctly set up the prototype chain for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    Ts.Object.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent` constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };
}());

/**
 * @class Ts.Plugin
 */
Ts.Plugin = Ts.Object.extend({

    parent: null,

    init: function(parent) {
        this.parent = parent;

        this.onInit();
    },

    onInit: Ts.emptyFn

});

/**
 * For managing micro history states.
 *
 * @type {Ts.Object}
 */
Ts.Historylet = (new Ts.Object({

    watches: {},

    current: null,

    history: null,

    onPopState : function() {
        if (!Modernizr.history || !this.history) {
            return;
        }

        var controller;

        if (this.current) {
            controller = this.popCurrentController();

            if (controller && !controller.cancelled) {
                controller.trigger('deactivate');
            }
        }

        var state = this.history.state;

        if (state) {
            state = state.number;
        }

        controller = this.watches[state];

        if (controller && !controller.cancelled) {
            controller.trigger('activate');
            this.current = controller.num;
        }
    },

    bind: function(history) {
        this.history = history;

        return this.history;
    },

    getCurrentController : function() {
        return this.watches[this.current];
    },

    popCurrentController: function() {
        var controller = this.watches[this.current];
        delete this.watches[this.current];
        delete this.current;
        return controller;
    },

    /**
     * Register a fleeting
     *
     * @param callback
     * @return controller object
     */
    push: function() {

        var num = Math.random();
        var that = this;

        var result = new Ts.Object({

            cancelled: false,

            num: num,

            initialize: function() {

            },

            cancel: function() {
                if (this.cancelled) {
                    return;
                } else if (this !== that.getCurrentController()) {
                    throw 'Only can cancel current one with this implementation';
                }

                this.cancelled = true;
                this.trigger('cancelled');
            }
        });

        this.watches[num] = result;

        if (this.history) {
            var controller = this.getCurrentController();

            if (controller && controller.cancelled) {
                this.history.replaceState({number: num}, window.title, window.url);
            } else {
                this.history.pushState({number: num}, window.title, window.url);
            }

            result.pushed = true;
        } else {
            result.pushed = false;
        }

        this.current = num;

        return result;
    }

}));

Ts.Historylet.bind(window.history);
$(window).on('popstate', $.proxy(Ts.Historylet.onPopState, Ts.Historylet));
