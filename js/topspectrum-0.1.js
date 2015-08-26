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
    emptyFn: function() {}
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

    /**
     * Register a fleeting
     *
     * @param callback
     * @return controller object
     */
    push: function(callback) {

        history.pushState({number: Math.random()}, window.title, window.url);

        return new Ts.Object({

            _cancelled: false,

            initialize: function() {
                this.listenToOnce($(window), 'popstate', $.proxy(this._popstate, this));
            },

            _popstate: function() {
                if (this._cancelled) {
                    return;
                }

                // TODO: check to see if it's our current state?

                Ts.ensureFn(callback)();
            },

            cancel: function() {
                if (this._cancelled) {
                    return;
                }

                this._cancelled = true;
                this.trigger('cancelled');
            }
        });
    }

}));