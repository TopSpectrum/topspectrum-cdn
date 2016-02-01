define(['jquery', 'underscore', 'app/Plugin', 'app/Application'], function ($, _, Plugin, Application) {

    /**
     * @class ActionShimPlugin
     */
    return Plugin.extend({

        xtype: 'ActionShimPlugin',

        _instance_cache: undefined,

        triggers: {
            'default': 'event',

            'event': function (plugin, cfg) {
                var actionName = cfg.action;
                var $el = cfg.$el;

                plugin.trigger('action', actionName, $el);

                if (actionName) {
                    plugin.trigger('action:' + actionName, actionName, $el);
                }
            }
        },

        /**
         * Start is called when the DOM is 100% ready and the app
         * is started.
         *
         * @returns {*}
         */
        start: function () {
            this._super();

            this._instance_cache = {
                'handler_path' : 'handler_instance'
            };

            var that = this;
            $(window.document.body).on('click', '[data-action][data-action-handler]', function (e) {
                e.preventDefault();

                var $actionEl = $(e.currentTarget);

                var cfg = {
                    $el: $actionEl,
                    action: $actionEl.attr('data-action'),
                    trigger: $actionEl.attr('data-action-trigger'),
                    handler: $actionEl.attr('data-action-handler')
                };

                var defaults = {
                    action: 'click',
                    handler: 'app/Application',
                    trigger: 'event'
                };

                var options = _.defaults({}, cfg, defaults);

                {
                    // track the original stuff for debugging
                    options._cfg = cfg;
                    options._defaults = defaults;
                }

                that.requireActionHandler(options);
            });
        },

        requireActionHandler: function (cfg) {
            var scope = this;


            var that = this;

            var action = cfg.action;
            var handler = cfg.handler;
            var $el = cfg.$el;
            var trigger = cfg.trigger;

            var triggerFn = this.getTrigger(trigger);

            function execute(plugin) {
                if (_.isArray(plugin)) {
                    _.each(plugin, execute, this);
                    return plugin;
                }

                if (_.isUndefined(plugin)) {
                    return false;
                }

                that.logger().debug('Triggering action: ' + action + ' on ', triggerFn, plugin, cfg);
                return triggerFn.apply(scope, [plugin, cfg])
            }

            // This object will hold our resulting required things.
            var result = {};

            if ('Application' === handler || handler === 'app/Application') {
                // The default is to fire on global.
                execute(Application);
            } else {
                if (handler) {
                    var previousExecutionResult = this._instance_cache[handler];

                    if (previousExecutionResult) {
                        if (previousExecutionResult.handler) {
                            execute(previousExecutionResult.handler);
                        } else {
                            // Must be still processing...
                        }

                        return;
                    }
                }

                function exec() {
                    if (false === execute(result.handler)) {
                        // Something fucked up...
                        delete result.handler;
                        delete result.created;
                    } else {
                        that._instance_cache[handler] = result;
                    }
                }

                if (!result.created) {
                    result.created = true;

                    this.logger().info('Creating [Action] - ', handler);

                    scope.parent
                        .addPlugin(handler)
                        .always(function (plugins) {
                            result.handler = plugins;

                            exec();
                        });
                } else {
                    exec();
                }
            }
        },

        getTrigger: function (cfg) {
            if (_.isFunction(cfg)) {
                return cfg;
            } else if (_.isString(cfg)) {
                return this.getTrigger(this.triggers[cfg]);
            } else if (_.isArray(cfg)) {
                throw 'We dont support this configuration yet';
            } else if (_.isNull(cfg) || _.isUndefined(cfg) || _.isNan(cfg)) {
                return function () {
                    console.log('Is this an error?!?! The config did not specify any trigger.', cfg);
                }
            } else {
                throw 'Unknown trigger';
            }
        }
    });
});