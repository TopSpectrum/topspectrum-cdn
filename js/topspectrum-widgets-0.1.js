/**
 * @class Ts.View
 * @extends Backbone.View
 */
Ts.View = Backbone.View.extend({

    $el : null,

    initialize: function (args) {
        $.extend(this, args);

        this._initialize(args);
    },

    _initialize : Ts.emptyFn

});

/**
 * @class Ts.Modal
 * @extends Ts.View
 */
Ts.Modal = Ts.View.extend({

    isShown: function() {
        return this.$el.hasClass('in');
    },

    show: function () {
        this.$el.modal('show');
        return this;
    },

    hide: function () {
        this.$el.modal('hide');
        return this;
    }
});

(function() {
    /**
     * @class Ts.Object
     * @extends Object
     */
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
 * @extends Ts.Object
 */
Ts.Plugin = Ts.Object.extend({

    parent: null,
    _children: null,
    _started: false,
    _initialized: false,

    initialize : function(args) {
        Ts.Object.prototype.initialize.apply(this, arguments);

        this._children = [];
    },

    /**
     * Children are initialized before the parent (though they can intercept this via events)
     *
     * @param parent
     */
    init : function(parent) {
        if (this._initialized) {
            throw 'Cannot init twice';
        }

        this._initialized = true;

        this.parent = parent;

        this.trigger('before_init');

        _.each(this._children, function(child) {
            child.init(this);
        }, this);

        this.onInit();

        this.trigger('after_init');
    },

    start : function() {
        if (this._started) {
            throw 'Cannot start twice';
        } else if (!this._initialized) {
            this.init(null);
        }

        this._started = true;

        this.onStart();

        _.each(this._children, function(child) {
            child.start();
        }, this);
    },

    addPlugin : function(plugin) {
        this._children.push(plugin);

        if (this._initialized) {
            plugin.init(this);
        }

        if (this._started) {
            plugin.start();
        }
    },

    onStart: Ts.emptyFn,
    onInit: Ts.emptyFn

});