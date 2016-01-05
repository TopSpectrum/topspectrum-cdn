define(
    ['underscore', 'backbone', 'jquery', 'Ts'],
    function (_, Backbone, $, Ts) {

        /**
         * A "Feature" will plug into an Application object.
         *
         * @class Feature
         */
        return Ts.Plugin.extend({

            model: function(modelId) {
                return this.parent.models.get(modelId);
            },

            afterInitialize: function() {
                Ts.Plugin.prototype.afterInitialize.apply(this, arguments);

                function array(a) {
                    if (!a) {
                        return [];
                    } else if (_.isArray(a)) {
                        return a;
                    } else {
                        return [a];
                    }
                }

                var scope = _.result(this.events, 'scope', this);
                var events = array(this.events);

                // iterate through the events.
                if (events) {
                    _.each(events, function(eventConfig) {
                        _.each(eventConfig, function(eventConfig, eventName) {
                            var fn;

                            if (_.isString(eventConfig)) {
                                fn = this[eventConfig];
                            } else if (_.isFunction(eventConfig)) {
                                fn = eventConfig;
                            } else {
                                throw 'We dont handle this situation yet';
                            }

                            this.listenTo(this, eventName, fn, scope);
                        }, this);
                    }, this);
                }
            }

        });
    });