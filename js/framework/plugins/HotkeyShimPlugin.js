define(['jquery', 'underscore', 'Ts', 'mousetrap'], function($, _, Ts, mousetrap) {

    /**
     * @class HotkeyShimPlugin
     */
    return Ts.Plugin.extend({

        triggers: {
            'default' : 'event',

            'event': function(plugin, cfg) {
                plugin.trigger('hotkey', [cfg.key, cfg]);
            }
        },

        /**
         * Start is called when the DOM is 100% ready and the app
         * is started.
         *
         * @returns {*}
         */
        start: function() {
            Ts.Plugin.prototype.start.apply(this, arguments);

            if (this.keys) {
                // The keys are 'classical'
                this.addKeys(this.keys);
            } else {
                var cfg = this._config;

                // The keys are non-classical. The properties of this
                // object are now our keys.
                if (!cfg) {
                    throw 'We cant handle this situation';
                }

                _.each(cfg, function(value, key) {
                    var config;

                    if (_.isString(value) || _.isArray(value)) {
                        config = { key: key, plugins: value };
                    } else {
                        throw 'We cant handle this situation';
                    }

                    this.addKeys(config);
                }, this);
            }

            if (this.autoload) {
                mousetrap.trigger(this.autoload);
            }
        },

        addKeys: function(keys) {
            if (_.isArray(keys)) {
                return _.each(keys, this.addKey, this);
            } else {
                this.addKey(keys);
            }
        },

        getTrigger : function(cfg) {
            if (_.isFunction(cfg)) {
                return cfg;
            } else if (_.isString(cfg)) {
                return this.getTrigger(this.triggers[cfg]);
            } else if (_.isArray(cfg)) {
                throw 'We dont support this configuration yet';
            } else if (_.isNull(cfg) || _.isUndefined(cfg) || _.isNan(cfg)) {
                return function() {
                    console.log('Is this an error?!?!');
                }
            } else {
                throw 'Unknown trigger';
            }
        },

        addKey: function(cfg) {
            var scope = this;

            var result = {

            };

            var triggerFn = this.getTrigger(_.result(cfg, 'trigger', 'event'));

            function execute(plugin) {
                if (_.isArray(plugin)) {
                    _.each(plugin, execute, this);
                    return plugin;
                }

                if (_.isUndefined(plugin)) {
                    return false;
                }

                return triggerFn.apply(scope, [ plugin, cfg ])
            }

            mousetrap.bind(cfg.key, function() {
                var plugins = cfg.plugins;

                function exec() {
                    if (false === execute(result.plugins)) {
                        // Something fucked up...
                        delete result.plugins;
                        delete result.created;
                    }
                }

                if (!result.created) {
                    result.created = true;

                    var deferred = scope.parent.addPlugin(plugins);

                    deferred.always(function(plugins) {
                        result.plugins = plugins;

                        exec();
                    });
                } else {
                    exec();
                }
            });
        }
    });
});