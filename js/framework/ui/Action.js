define(
    ['jquery', 'app/Plugin', 'ui/View'],
    function($, Plugin, View) {

        /**
         * @class ActionPlugin
         * @alias Action
         * @alias app.Action
         *
         * @extends Plugin
         */
        var ActionPlugin = Plugin.extend({

            xtype: 'Action',

            /**
             * @property actions
             */
            actions: {

            },

            attach: function(parent) {
                this._super(parent);

                this.listenTo(this, 'action', this.triggerAction);
            },

            /**
             *
             * @param {String} actionName
             * @param {jQuery} $el
             * @return
             */
            triggerAction: function(actionName, $el) {
                function exec(fn) {
                    if (fn) {
                        if (_.isString(fn)) {
                            if (exec.call(this, this.actions[fn])) {
                                return true;
                            } else if (exec.call(this, this['action:' + fn])) {
                                return true;
                            } else {
                                console.log('not found', fn);
                                return false;
                            }
                        } else if (_.isFunction(fn)) {
                            fn.apply(this, [actionName, $el]);
                            return true;
                        }
                    } else {
                        // not found
                        return false;
                    }
                }

                if (!exec.call(this, actionName)) {
                    throw 'handler not found for: ' + actionName;
                }
            }
        });

        return ActionPlugin;
    }
);