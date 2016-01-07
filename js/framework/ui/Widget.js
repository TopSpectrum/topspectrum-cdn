define(
    ['jquery', 'underscore', 'Ts', 'app/View', 'app/Plugin'],
    /**
     *
     * @param {jQuery} $
     * @param {underscore} _
     * @param {Ts} Ts
     * @param {View} View
     * @param {Plugin} Plugin
     * @returns {*}
     */
    function ($, _, Ts, View, Plugin) {

        /**
         * @class DefaultView
         * @extends View
         */
        var WidgetView = View.extend({

            xtype: 'WidgetView',

            init: function() {
                this._super();

                if (this.xtype === 'WidgetView') {
                    if (this.widget && this.widget.xtype) {
                        this.xtype = this.widget.xtype + 'View';
                    }
                }
            },

            afterInitialize: function () {
                this._super();

                // If we are in "template mode" then let's see if we have any triggers.
                // If we have a model, we should autorender.

                if (this._compiledTemplate) {
                    this.render();
                }
            },

            getModel: function () {
                var model = this.model;
                var widget = this.widget;

                if (model) {
                    return model;
                } else if (widget) {
                    if (widget.model) {
                        return widget.model;
                    }
                }

                return this;
            }
        });

        /**
         * @class Widget
         * @extends Plugin
         */
        var Widget = Plugin.extend({

            /**
             * The original data that was passed into the object.
             * The primary use-case for a Widget is for it to be autowired.
             * All of the [data-*] attributes on the widget will appear here.
             *
             * @type Object
             */
            data: undefined,

            /**
             * @type Backbone.View
             */
            view: undefined,

            xtype: 'Widget',

            /**
             * @type jQuery
             */
            $el: undefined,

            attach: function(parent) {
                this._super(parent);

                // Merge in our config. Just in case it already exists.
                {
                    this.data = _.extend(_.result(this, 'data', {}), this.$el.data());
                }

                {
                    var ViewClass = this.view || WidgetView;
                    //var $children = this.$el.children();

                    var cfg = _.extend({}, {
                        widget: this,
                        parent: this,
                        model: this.getViewModel(),
                        el: this.$el
                    });

                    this.view = new ViewClass(cfg);
                }
            },

            start: function () {
                this._super();

                Ts.Preconditions.checkExists(this.$el, 'Element for the widget must be defined.');
                Ts.Preconditions.checkExists(this.$el.length, 'Element for the widget must be defined.');

                // We need to remove our widget from the Dom.

                this.render();
            },

            getViewModel: function () {
                return this.model;
            },

            render: function() {
                this.logger().debug('render');
                this.view.render();

                return this;
            }
        });

        Widget.View = WidgetView;

        return Widget;
    });