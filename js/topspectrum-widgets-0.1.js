//if (window.Cocktail) {
//    Cocktail.patch(Backbone);
//}

/**
 * @class View
 * @class Ts.View
 * @extends Backbone.View
 */
Ts.View = Backbone.View.extend({

    $el: null,

    xtype: 'View',

    /**
     * The "events" hash is a clusterfuck. As far as I can tell, Backbone fucked up here.
     * If a guy creates a new View() and provides their own "events" object, it clobbers/destroys the class
     * definition's events hash. After searching online, a recommendation is to create a "listeners" object
     * that instantiations can use. Inheritance chains use "events" while instances use "listeners"
     *
     * @type Object
     */
    listeners: undefined,

    /**
     * The model that is used for templating.
     */
    model: null,

    /**
     * If you want to require an instance to declare these objects. Ex: ['thiz', 'that', 'another'];
     *
     * @type Array
     */
    requiredOptions: null,

    /**
     * @type Object
     */
    __subviews: undefined,

    rendered: false,

    tpl: undefined,

    items: null,

    plugins: null,

    /**
     * Execute a quick log statement.
     *
     * @returns {View}
     */
    log: function () {
        var logger = this.logger();
        logger.debug.apply(logger, arguments);
        return this;
    },

    /**
     * Get the logger for you to use.
     *
     * @returns {*|{info, warn, error, log, debug}}
     */
    logger: function () {
        if (!this._logger_instance) {
            var name = this.xtype + '#' + this.cid + '';
            this._logger_instance = Ts.Logger(name);
        }

        return this._logger_instance;
    },

    initialize: function (args) {
        args = args || {};
        this.beforeInitialize(args);
        var result = this.init(args);
        this.afterInitialize(args);
        return result;
    },

    setElement: function (element, delegate) {
        // Our element contents are actually a handlebars template
        var $el = $(element);

        var id = $el.attr('id') || this.cid;

        if (id) {
            this.cid = id;
        }

        // Does it have an id? If it does, we need to make it ours.
        if (!$el.attr('id')) {
            $el.attr('id', id);
        }

        // Declare that we are not rendered.
        $el.attr('data-rendered', 'false');

        var containsScriptTagTemplate = ($el.is('script[type="text/x-handlebars-template"]'));
        var containsATemplate = ($el.is('[data-view-template="true"]'));
        var isAnyKindOfTemplate = containsScriptTagTemplate || containsATemplate;
        var existingTemplate = this.getTemplate();

        if (isAnyKindOfTemplate && existingTemplate) {
            this.logger().warn('The element you passed to me looks like a template, but I already have one.', existingTemplate);
        }

        if (!existingTemplate) {
            // We don't have an existing template. Let's try to auto detect one?

            if (isAnyKindOfTemplate) {
                var tpl;

                if (containsScriptTagTemplate) {
                    // We need to remove this element.
                    // The script tag is our html.
                    tpl = Handlebars.compile($el.html());

                    var $replacementEl = $(Handlebars.compile('<view id="{{ cid }}" data-view-template="compiled" data-view-rendered="false"></view>')(this));

                    {
                        $el.replaceWith($replacementEl);
                        $el = $replacementEl
                    }

                    this.log('Replacing script tag template with a view node. You should consider rendering now.');
                } else if (containsATemplate) {
                    // So we are a template, but we don't need to replace the node.
                    tpl = Handlebars.compile($el.html());

                    this.log('Accepting the content of the element as our template. You should consider rendering now.');
                } else {
                    // TODO: support more template types.
                }

                this.tpl = tpl;
                this._compiledTemplate = true;
            }
        }

        return this._super($el, delegate);
    },

    __get_functions: function () {
        var res = [];
        var names = Object.getOwnPropertyNames(this);

        for (var name in names) {
            if (typeof this[name] == "function") {
                res.push(name);
            }
        }

        return res;
    },

    beforeInitialize: function (args) {
        var listeners = [];

        args = args || {};

        if (this.listeners || args.listeners) {
            function __force_array(value) {
                if (!value) {
                    return [];
                } else if (_.isArray(value)) {
                    return value;
                } else {
                    return [value];
                }
            }

            listeners = _.union(__force_array(args.listeners), __force_array(this.listeners));
        }

        $.extend(this, args);

        this.__subviews = {
            instances: [],
            assignments: {

            }
        };

        if (listeners) {
            var globalScope = _.result(args.listeners, 'scope') || _.result(this.listeners, 'scope') || this;

            function resolveEventName(eventName) {
                if (!eventName) {
                    return; // returns undefined.
                }

                if (_.isString(eventName)) {
                    return [eventName]; // returns array
                } else if (_.isArray(eventName)) {
                    return eventName; // returns array
                }

                throw 'Unable to determine event name';
            }

            _.each(listeners, function (listener, index) {
                var scope = listener.scope || globalScope;
                var fn = listener.fn;
                var events = resolveEventName(listener.events || listener.on);
                var event = resolveEventName(listener.event);

                // Optionally attach on the "event" field

                if (_.isArray(event)) {
                    if (_.isUndefined(events)) {
                        events = event;
                    } else {
                        events = _.union(events, event);
                    }
                }

                if (_.isUndefined(events)) {
                    // The events list is undefined. This must be the "object keys are event names" situation.
                    _.each(listener, function (value, key) {
                        if ('scope' === key) {
                            return;
                        }

                        var _fn = value;
                        var eventName = key;
                        var __fn = _fn || fn;

                        if (_.isString(__fn)) {
                            __fn = this[_fn];
                        }

                        if (scope !== this) {
                            __fn = $.proxy(__fn, scope);
                        }

                        this.listenTo(this, eventName, __fn);
                    }, this);
                } else {
                    // The events array is defined, so we're going to pick the names out of that.

                    if (_.isString(fn)) {
                        fn = this[fn];
                    }

                    if (scope !== this) {
                        fn = $.proxy(fn, scope);
                    }

                    _.each(events, function (eventName) {
                        this.listenTo(this, eventName, fn);
                    }, this);
                }
            }, this);
        }

        if (this.requiredOptions) {
            _.each(this.requiredOptions, function (value) {
                if (_.isUndefined(this[value])) {
                    throw 'Param option ' + value + ' is required and was not passed in.';
                }
            }, this);
        }

        // The args/config are already applied to us on lines above.
        $.applyIf(this, {
            instances: [],
            plugins: []
        });

        // We need to init the plugins.
        _.each(this.plugins, function (plugin) {
            plugin.attach(this);
        }, this);

        return this;
    },

    /**
     * Will assign a unique ID to this instance (if not already defined)
     * Will start all of the children plugins.
     * Will trigger an event declaring that we are initialized.
     *
     * @protected
     * @returns {Ts.View}
     */
    afterInitialize: function () {
        if (!this.cid) {
            this.cid = _.uniqueId('view_');
        }

        // We need to init the plugins.
        _.each(this.plugins, function (plugin) {
            plugin.start();
        }, this);

        this.trigger('initialized');

        if (this.autorender) {
            this.render();
        }

        return this;
    },

    /**
     * @protected
     * @constructor
     */
    init: function () {},

    /**
     * Used to assign a view to a particular el within your el (via selector)
     *
     * Tells the subview to assign to that El and then calls render on it to refresh it.
     *
     * @param view
     * @param selector
     */
    refreshView: function (selector, view) {
        var selectors;

        if (_.isObject(selector)) {
            selectors = selector;
        } else {
            selectors = {};
            selectors[selector] = view;
        }

        if (!selectors) {
            return;
        }

        _.each(selectors, function (view, selector) {
            var corrected = selector.startsWith('!');

            if (corrected) {
                selector = selector.substring(1);
            }

            var $el = this.$(selector);

            if (!$el || !$el.length) {
                this.logger().warn('Could not find child by selector "' + selector + '"');
            }

            if (!corrected) {
                // We need to attach to the parent.
                var $child = $(view.el);

                // Contains only accepts DOM nodes...
                if (!$.contains($el[0], $child[0])) {
                    //this.log('render child append');
                    $el.append($child);
                } else {
                    //this.log('render child NOT append', $child[0]);
                }

                view.render();
            } else {
                view.setElement($el).render();
            }
        }, this);
    },

    addSubview: function (view) {
        this.__subviews.instances.push(view);
        this.log('view added: ', view);
        this.listenTo(view, 'removed', function () {
            // This view was removed.
            this.log('view removed: ', view);

            // Let's delete it from our instances list
            this.__subviews.instances = _.without(this.__subviews.instances, view);
            // Damn, now we have to SEARCH for our selector..
            _.each(this.__subviews.assignments, function (this_view, selector) {
                if (this_view === view) {
                    // They are the same.
                    delete this.__subviews.assignments[selector];
                }
            }, this);
        });

        return view;
    },

    /**
     * Assign a subview to a part of our dom.
     *
     * @param {String|Object} selector
     * @param {View} view
     */
    assignSubview: function (selector, view) {
        var selectors;

        if (_.isObject(selector)) {
            selectors = selector;
        } else {
            selectors = {};
            selectors[selector] = view;
        }

        if (!selectors) {
            return;
        }

        // Let's make sure that they are already registered.
        _.each(selectors, function(view, selector) {
            if (this.__subviews.instances.indexOf(view) == -1) {
                this.__subviews.instances.push(view);
            }
        }, this);

        _.extend(this.__subviews.assignments, selectors);

        return view || selector;
    },

    render: function () {
        this.beforeRender();
        this._render();
        this._renderSubviews();
        this.afterRender();

        return this;
    },

    _renderSubviews: function () {
        if (!this.__subviews) {
            return;
        }

        _.each(this.__subviews.assignments, function (subview, selector) {
            this.refreshView(selector, subview);
        }, this);
    },

    beforeRender: function () {
        this.trigger('beforeRender');
    },

    _render: function () {
        var html = this.applyTemplate();

        if (!_.isUndefined(html)) {
            this.$el.html(html);
        }

        this.$el.attr('id', this.cid);

        if (this.xtype) {
            this.$el.attr('xtype', this.xtype);
        }

        this.$el.attr('data-rendered', 'true');
        this.$el.attr('data-rendered-timestamp', Date.now());

        return this;
    },

    applyTemplate: function () {
        var tpl = this.getTemplate();

        if (!tpl) {
            return;
        }

        var args = this.getTemplateArgs();

        return tpl.call(this, args);
    },

    afterRender: function () {
        this.initEl();
        
        this.rendered = true;
        this.trigger('afterRender');
    },

    /**
     * This is where you should attach your event listeners. It happens during render.
     */
    initEl: function () {
        if (this.cls) {
            this.$el.addClass(this.cls);
        }
    },

    getModel: function () {
        if (this.model) {
            return this.model;
        } else {
            return this;
        }
    },

    getTemplateArgs: function () {
        var model = this.getModel();

        if (model) {
            if (_.isFunction(model.toJSON)) {
                return model.toJSON();
            } else {
                return model;
            }
        } else {
            return this;
        }
    },

    getTemplate: function () {
        if (!this.tpl) {
            // No rendering needed if we have no template.
            return null;
        }

        if (_.isFunction(this.tpl)) {
            // return below.
        } else if (_.isString(this.tpl)) {
            this.tpl = Handlebars.compile(this.tpl);
        } else if (_.isArray(this.tpl)) {
            this.tpl = Handlebars.compile(this.tpl.join(''));
        } else {
            throw 'Unknown template type ' + this.tpl
        }

        return this.tpl;
    },

    getRenderedEl: function () {
        if (!this.rendered) {
            this.render();
        }

        return this.$el;
    },

    isAttached: function () {
        if (!this.$el) {
            return false;
        }

        return 0 !== this.$el.parent().length;
    },

    remove: function () {
        if (this.__subviews) {
            var instances = this.__subviews.instances;

            _.each(instances, function (subview) {
                if (subview && _.isFunction(subview.remove)) {
                    subview.remove.apply(subview, arguments);
                }
            });

            // Clear the array. Recommended solution online.
            // http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
            this.__subviews.instances.length = 0;
            this.__subviews.assignments = {};
            delete this.__subviews;
        }

        if (this.plugins) {
            _.each(this.plugins, function (plugin) {
                plugin.destroy();
            }, this);

            // Clear the array. Recommended solution online.
            // http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
            this.plugins.length = 0;
        }

        this.trigger('removed');

        // This will call stopListening()
        Backbone.View.prototype.remove.apply(this, arguments);

        delete this.__subviews;
        delete this.plugins;
        delete this.model;
        delete this.tpl;
        delete this.listeners;
        delete this.requiredOptions;
        delete this.options;
        delete this.rendered;

        return this;
    }

});

Ts.View.extend = function (child) {
    var view = Backbone.View.extend.apply(this, arguments);

    view.prototype.listeners = _.extend({}, this.prototype.listeners, child.listeners);
    view.prototype.events = _.extend({}, this.prototype.events, child.events);

    return view;
};

/**
 * @class Ts.Modal
 * @extends Ts.View
 */
Ts.Modal = Ts.View.extend({

    isShown: function () {
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

(function () {
    /**
     * @class Ts.Object
     * @extends Object
     * @constructor
     */
    Ts.Object = function (options) {
        _.extend(this, options);
        this.initialize.apply(this, arguments);
    };

    // Attach all inheritable methods to the Model prototype.
    _.extend(Ts.Object.prototype, Backbone.Events, {

        /**
         * The original config that was passed into the constructor.
         *
         * @type Object
         */
        _config: undefined,

        xtype: 'Object',

        /**
         * @private
         * @constructor
         */
        initialize: function (args) {
            // The original config.
            this._config = args;
            this.cid = _.uniqueId('plugin_');
            this.beforeInitialize(args);
            this.init(args);
            this.afterInitialize();
        },

        log: function () {
            var logger = this.logger();
            logger.debug.apply(logger, arguments);
            return this;
        },

        logger: function () {
            if (!this._logger_instance) {
                var name = this.xtype + '#' + this.cid + '';
                this._logger_instance = Ts.Logger(name);
            }

            return this._logger_instance;
        },

        /**
         * @protected
         */
        beforeInitialize: Ts.emptyFn,

        /**
         * @protected
         */
        afterInitialize: Ts.emptyFn,

        /**
         * @protected
         * @constructor
         */
        init: Ts.emptyFn

    });

    // Helper function to correctly set up the prototype chain for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    //Ts.Object.extend = function(protoProps, staticProps) {
    //    var parent = this;
    //    var child;
    //
    //    // The constructor function for the new subclass is either defined by you
    //    // (the "constructor" property in your `extend` definition), or defaulted
    //    // by us to simply call the parent constructor.
    //    if (protoProps && _.has(protoProps, 'constructor')) {
    //        child = protoProps.constructor;
    //    } else {
    //        child = function(){ return parent.apply(this, arguments); };
    //    }
    //
    //    // Add static properties to the constructor function, if supplied.
    //    _.extend(child, parent, staticProps);
    //
    //    // Set the prototype chain to inherit from `parent`, without calling
    //    // `parent` constructor function.
    //    var Surrogate = function(){ this.constructor = child; };
    //    Surrogate.prototype = parent.prototype;
    //    child.prototype = new Surrogate;
    //
    //    // Add prototype properties (instance properties) to the subclass,
    //    // if supplied.
    //    if (protoProps) {
    //        _.extend(child.prototype, protoProps);
    //    }
    //
    //    // Set a convenience property in case the parent's prototype is needed
    //    // later.
    //    child.__super__ = parent.prototype;
    //
    //    return child;
    //};
    Ts.Object.extend = Backbone.Model.extend;
}());

/**
 * @class Plugin
 * @alias Ts.Plugin
 * @extends Ts.Object
 */
Ts.Plugin = Ts.Object.extend({

    /**
     * @type object
     * @private
     */
    parent: undefined,

    /**
     * @type array
     * @private
     */
    _items: undefined,

    /**
     * @type boolean
     * @private
     */
    _started: false,

    /**
     * @type boolean
     * @private
     */
    _attached: false,

    /**
     * @type boolean
     * @private
     */
    _destroyed: false,

    /**
     * If this is set to true, it will make this plugin transparent.
     * The children will be initialized directly onto our parent.
     * Essentially this plugin becomes a thin wrapper.
     * Only trigger this to true if you know what you're doing. It's only for a very specific use-case where  you want
     * an object to host plugins but cannot make it a Plugin itself.
     */
    pluginHostMode: false,

    xtype: 'Plugin',

    init: function () {
        this._super();

        var items = _.result(this, 'items', []);

        if (!_.isArray(items)) {
            if (_.isObject(items)) {
                items = [items];
            } else {
                items = [];
            }
        }

        this._items = items;
    },

    /**
     * Children are initialized before the parent (though they can intercept this via events)
     *
     * They are only initialized once and only once.
     *
     * @param parent
     * @public
     */
    attach: function (parent) {
        if (this._attached) {
            throw 'Cannot attach twice';
        }

        this._attached = true;

        this.parent = parent;

        this.beforeAttach();

        if (this.parent) {
            this.listenTo(this.parent);
        }

        _.each(this._items, function (child) {
            child.attach(this.__get_parent());
        }, this);

        this.onAttach();
        this.afterAttach();

        return this;
    },

    /**
     * Children are started after the parent has finished initialization.
     *
     * They are only started once and only once.
     *
     * @public
     */
    start: function () {
        if (this._started) {
            throw 'Cannot start twice';
        } else if (!this._attached) {
            throw 'Cannot start if not attached';
        }

        this._started = true;

        this.beforeStart();

        _.each(this._items, function (child) {
            child.start();
        }, this);

        this.afterStart();

        return this;
    },

    /**
     * @public
     * @param plugins
     * @returns {*}
     */
    addPlugin: function (plugins) {
        if (_.isArray(plugins)) {
            _.each(plugins, function (plugin) {
                this.addPlugin(plugin);
            }, this);
            return plugins;
        }

        this._items.push(plugins);

        if (this._attached) {
            plugins.attach(this);
        }

        if (this._started) {
            plugins.start();
        }

        return $.Deferred().resolveWith(this, [plugins]).promise();
    },

    /**
     * Called when the parent is created.
     * This is before all of the plugins have been initialized.
     * You are allowed to modify your parent, but should not depend on any other plugins.
     * @private
     */
    afterAttach: function () {
        this.trigger('afterAttach');
        return this;
    },

    onAttach: function() {},

    /**
     * @private
     * @returns {Ts.Plugin}
     */
    beforeAttach: function () {
        this.trigger('beforeAttach');
        return this;
    },

    /**
     * This happens after all the plugins have been initialized.
     * You shouldn't modify the parent anymore, but you can trust that the other plugins have done their stuff and
     * are available.
     * @private
     */
    beforeStart: function () {
        this.trigger('beforeStart');
        return this;
    },

    /**
     * @private
     * @returns {Ts.Plugin}
     */
    afterStart: function () {
        this.trigger('afterStart');
        return this;
    },

    /**
     * @public
     * @returns {Ts.Plugin}
     */
    destroy: function () {
        if (this._destroyed) {
            throw 'Can only destroy once';
        }

        this.beforeDestroy();

        _.each(this._items, function (item) {
            item.destroy();
        });

        this.afterDestroy();
        return this;
    },

    /**
     * @private
     * @returns {Ts.Plugin}
     */
    beforeDestroy: function () {
        this.trigger('beforeDestroy');
        return this;
    },

    /**
     * @private
     * @returns {Ts.Plugin}
     */
    afterDestroy: function () {
        this.trigger('afterDestroy');
        this.trigger('destroyed');
        return this;
    },

    /**
     * Determines what parent we should tell our children about.
     *
     * @private
     */
    __get_parent: function () {
        if (this.pluginHostMode) {
            return this.parent || this;
        } else {
            return this;
        }
    }

});