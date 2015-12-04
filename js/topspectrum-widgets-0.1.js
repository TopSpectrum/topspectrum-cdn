/**
 * @class Ts.View
 * @extends Backbone.View
 */
Ts.View = Backbone.View.extend({

    $el : null,

    /**
     * The "events" hash is a clusterfuck. As far as I can tell, Backbone fucked up here.
     * If a guy creates a new View() and provides their own "events" object, it clobbers/destroys the class
     * definition's events hash. After searching online, a recommendation is to create a "listeners" object
     * that instantiations can use. Inheritance chains use "events" while instances use "listeners"
     *
     * @type Object
     */
    listeners: null,

    /**
     * If you want to require an instance to declare these objects. Ex: ['thiz', 'that', 'another'];
     *
     * @type Array
     */
    requiredOptions: null,

    rendered: false,

    tpl: '<div id="{{#if cid}}{{cid}}{{else}}{{id}}{{/if}}"></div>',

    items: null,

    plugins: null,

    initialize: function (args) {
        this.beforeInitialize(args);
        this._initialize(args);
        this.afterInitialize(args);
        return this;
    },

    beforeInitialize: function(args) {
        if (args) {
            if (this.listeners && args.listeners) {
                args.listeners = _.extend({}, this.listeners, args.listeners);
            }

            $.extend(this, args);
        }

        if (this.listeners) {
            _.each(this.listeners, function(method, eventName) {
                if (!_.isFunction(method)) {
                    method = this[method];

                    if (!_.isFunction(method)) {
                        return;
                    }
                }

                this.listenTo(this, eventName, method);
            }, this);
        }

        if (this.requiredOptions) {
            _.each(this.requiredOptions, function(value) {
                if (_.isUndefined(this[value])) {
                    throw 'Param option ' + value + ' is required and was not passed in.';
                }
            }, this);
        }

        // The args/config are already applied to us on lines above.
        $.applyIf(this, {
            items: [],
            plugins: []
        });

        // We need to init the plugins.
        _.each(this.plugins, function(plugin) {
            plugin.init(this);
        }, this);

        return this;
    },

    afterInitialize: function() {
        // We need to init the plugins.
        _.each(this.plugins, function(plugin) {
            plugin.start();
        }, this);

        this.trigger('initialized');
        return this;
    },

    // private method for you to sneak in your init
    _initialize : Ts.emptyFn,

    assignView : function(view, selector) {
        view.setElement(this.$(selector)).render();
    },

    render: function() {
        this.beforeRender();
        this._render();
        this.afterRender();
    },

    beforeRender: function() {
        this.trigger('beforeRender');
    },

    _render: function() {
        var tpl = this.getTemplate();
        var args = this.getTemplateArgs();

        this.$el.html(tpl(args));

        return this;
    },

    afterRender: function() {
        this.rendered = true;
        this.trigger('afterRender');
    },

    getTemplateArgs : function() {
        if (this.model) {
            if (_.isFunction(this.model.toJSON)) {
                return this.model.toJSON();
            } else {
                return this.model;
            }
        } else {
            return this;
        }
    },

    getTemplate: function() {
        if (!this.tpl) {
            // No rendering needed if we have no template.
            return Handlebars.compile('');
        }

        if (_.isFunction(this.tpl)) {
            // return below.
        } else if (_.isString(this.tpl)) {
            this.tpl = Handlebars.compile(this.tpl);
        } else if (_.isArray(this.tpl)) {
            this.tpl = Handlebars.compile(this.tpl.join(' '));
        } else {
            throw 'Unknown template type ' + this.tpl
        }

        return this.tpl;
    },

    renderedEl: function() {
        if (!this.rendered) {
            this.render();
        }

        return this.$el;
    },

    isAttached: function() {
        if (!this.$el) {
            return false;
        }

        return 0 !== this.$el.parent().length;
    },

    remove: function() {if (this.items) {
            _.each(this.items, function(subview) {
                if (subview && _.isFunction(subview.remove)) {
                    subview.remove.apply(subview, arguments);
                }
            });
            delete this.items;
        }

        if (this.plugins) {
            _.each(this.plugins, function(plugin) {
                plugin.destroy();
            }, this);
            delete this.plugins;
        }

        // This will call stopListening()
        Backbone.View.prototype.remove.apply(this, arguments);

        this.trigger('removed');
        return this;
    },

    addSubview: function(view) {
        this.items.push(view);
    }

}, {
    extend: function(child) {
        var view = Backbone.View.extend.apply(this, arguments);
        view.prototype.listeners = _.extend({}, this.prototype.listeners, child.listeners);
        view.prototype.events = _.extend({}, this.prototype.events, child.events);
        return view;
    }
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

    items: null,

    _started: false,
    _initialized: false,
    _destroyed: false,

    initialize : function(args) {
        var items = _.result(args, 'items', []);

        if (!_.isArray(items)) {
            if (_.isObject(items)) {
                items = [items];
            } else {
                items = [];
            }
        }

        args.items = this.items;

        Ts.Object.prototype.initialize.apply(this, arguments);
    },

    /**
     * Children are initialized before the parent (though they can intercept this via events)
     *
     * They are only initialized once and only once.
     *
     * @param parent
     */
    init : function(parent) {
        if (this._initialized) {
            throw 'Cannot init twice';
        }

        this._initialized = true;

        this.parent = parent;

        this.beforeInit();

        _.each(this.items, function(child) {
            child.init(this);
        }, this);

        this.afterInit();

        return this;
    },

    /**
     * Children are started after the parent has finished initialization.
     *
     * They are only started once and only once.
     */
    start : function() {
        if (this._started) {
            throw 'Cannot start twice';
        } else if (!this._initialized) {
            this.init(null);
        }

        this._started = true;

        this.onStart();

        _.each(this.items, function(child) {
            child.start();
        }, this);

        return this;
    },

    addPlugin : function(plugin) {
        this.items.push(plugin);

        if (this._initialized) {
            plugin.init(this);
        }

        if (this._started) {
            plugin.start();
        }
    },

    /**
     * Called when the parent is created.
     * This is before all of the plugins have been initialized.
     * You are allowed to modify your parent, but should not depend on any other plugins.
     */
    afterInit: function() {
        this.trigger('afterInit');
        return this;
    },

    beforeInit: function() {
        this.trigger('beforeInit');
        return this;
    },

    /**
     * This happens after all the plugins have been initialized.
     * You shouldn't modify the parent anymore, but you can trust that the other plugins have done their stuff and
     * are available.
     */
    beforeStart: function() {
        this.trigger('beforeStart');
        return this;
    },

    afterStart: function() {
        this.trigger('afterStart');
        return this;
    },

    destroy: function() {
        if (this._destroyed) {
            throw 'Can only destroy once';
        }

        this.beforeDestroy();

        _.each(this.items, function(item) {
            item.destroy();
        });

        this.afterDestroy();
        return this;
    },

    beforeDestroy: function() {
        this.trigger('beforeDestroy');
        return this;
    },

    afterDestroy: function() {
        this.trigger('afterDestroy');
        this.trigger('destroyed');
        return this;
    }

});