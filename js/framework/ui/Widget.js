define(
    ['jquery', 'underscore', 'Ts', 'ui/View', 'app/Plugin', 'app/Model'],
    /**
     *
     * @param {jQuery} $
     * @param {underscore} _
     * @param {Ts} Ts
     * @param {View} View
     * @param {Plugin} Plugin
     * @param {Model} Model
     * @returns {*}
     */
    function ($, _, Ts, View, Plugin, Model) {

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
            viewType: undefined,

            /**
             * @type Backbone.View
             * @private
             */
            view: undefined,

            xtype: 'Widget',

            /**
             * @type jQuery
             */
            $el: undefined,

            els: undefined,
            models: undefined,

            onAttach: function() {
                this._super();

                // Merge in our config. Just in case it already exists.
                {
                    this.data = _.extend(_.result(this, 'data', {}), this.$el.data());
                }

                if (this.els) {
                    var $el = this.$el;
                    this.log('Attaching elements:', this.els);

                    var obj = {};
                    _.each(this.els, function(value, key) {
                        var $target = $el.find(key);
                        var required = true;

                        if (!$target || !$target.length) {
                            throw 'Could not find by selector: ' + key;
                        }

                        this.log('Attaching ' + key + ' as ' + value + ': ', $target);
                        obj[value] = $target;
                    }, this);
                    this.els = obj;

                    this.log('Attached elements:', this.els);
                }

                if (this.models) {
                    this.log('Attaching models:', this.models);

                    var models = {};
                    _.each(this.models, function(value, key) {
                        var $el = this.$el.find(key);
                        var model = Model.parse($el);

                        models[value] = model;
                    }, this);

                    this.models = models;
                    this.log('Attached models:', this.models);
                } else {
                    this.models = {};
                }

                // Copy over the important ones. Should this be centralized?
                this.models.profile = this.parent.profile;
                this.models.site = this.parent.site;
            },

            start: function () {
                this._super();

                Ts.Preconditions.checkExists(this.$el, 'Element for the widget must be defined.');
                Ts.Preconditions.checkExists(this.$el.length, 'Element for the widget must be defined.');

                // We need to remove our widget from the Dom.

                this.render();
            },

            getView: function() {
                if (this.view) {
                    return this.view;
                }

                {
                    var ViewClass = this.viewType || Widget.View;

                    this.view = new ViewClass(this.getViewOptions());
                }

                return this.view;
            },

            getViewOptions: function() {
                return _.extend({}, {
                    widget: this,
                    parent: this,
                    model: this.getViewModel(),
                    el: this.$el
                });
            },

            getViewModel: function () {
                return this.model;
            },

            render: function() {
                this.getView().render();

                return this;
            }
        });

        Widget.View = WidgetView;

        return Widget;
    });