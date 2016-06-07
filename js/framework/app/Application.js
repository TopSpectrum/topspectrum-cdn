define(['underscore', 'Ts', 'Promise'], function(_, Ts, Promise) {
    
    /**
     * @class Application
     */
    var Application = Ts.Plugin.extend({

        xtype: 'Application',

        shims : {
            'hotkey': 'HotkeyShimPlugin'
        },

        setProfile: function(profile) {
            if (!profile) {
                this.profile.clear();
            } else {
                this.profile.clear({silent: true});

                if (profile.toJSON) {
                    this.profile.set(profile.toJSON());
                } else {
                    this.profile.set(profile);
                }
            }

            this.trigger('loggedin');
        },

        model: function(modelId) {
            return this.models.get(modelId);
        },

        /**
         * Registers a Plugin with this Application.
         *
         * @param cfg
         * @returns {*}
         */
        addPlugin: function(cfg) {
            if (_.isArray(cfg)) {
                return _.each(cfg, this.addPlugin, this);
            }

            if (_.isString(cfg)) {
                cfg = { xtype: cfg };
            }

            var xtype = _.result(cfg, 'xtype');
            xtype = _.result(this.shims, xtype, xtype);

            if (!xtype || (cfg instanceof Ts.Plugin)) {
                scope.log('just adding to parent since its already a cfg');
                // It is a real instance already.
                return Ts.Plugin.prototype.addPlugin.apply(this, arguments);
            }

            var scope = this;

            // Nuke the xtype from the object.
            // That's because we don't need it anymore.
            delete cfg.xtype;

            var deferred = $.Deferred();

            require([ xtype ], function(Plugin) {
                if (!Plugin) {
                    throw 'The require statement did not return a plugin: ' + xtype;
                }

                // Instantiate a new instance with the given config.
                var result = new Plugin(cfg);
                scope.log('creating plugin', cfg, JSON.stringify(cfg));
                // Give it an instance to the Application object.
                                var promise = Ts.Plugin.prototype.addPlugin.apply(scope, [ result ]);

                promise.done(function() {
                    deferred.resolveWith(scope, arguments);
                });
            });

            return deferred;
        },

        ajax: function(options) {
            return Promise.resolve($.ajax(options));
        }

    });

    /**
     * Instantiate the Singleton.
     */
    var app = new Application({
        profile: new Backbone.Model(window.profile)
    });

    app.addPlugin('AutowirePlugin');

    return app;
});