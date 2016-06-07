define(
    ['jquery', 'underscore', 'app/Object', 'app/Plugin'],

    function ($, _, Object, Plugin) {
        // /**
        //  * @class AbstractBinding
        //  */
        // var AbstractBinding = Object.extend({
        //
        //     /**
        //      * @type {Model}
        //      * @config
        //      */
        //     model: null,
        //
        //     /**
        //      * @type {Function}
        //      * @config
        //      */
        //     predicateFn: null,
        //
        //     /**
        //      * @type {String}
        //      * @config
        //      */
        //     property: null,
        //
        //     /**
        //      * @type {String}
        //      * @config
        //      */
        //     selector: null,
        //
        //     /**
        //      * @type {Object}
        //      * @config
        //      */
        //     scope: null,
        //
        //     /**
        //      * @type {function}
        //      * @config
        //      */
        //     fn: null,
        //
        //     /**
        //      * @type {View}
        //      * @config
        //      */
        //     view: null,
        //
        //     /**
        //      *
        //      * @param {Object} options
        //      * @param {Model} options.model
        //      * @param {Function} options.predicateFn
        //      * @param {String} options.property
        //      * @param {String} options.selector
        //      * @param {*} [options.scope]
        //      * @param {function} options.fn
        //      * @param {View} options.view
        //      */
        //     initialize: function(options) {
        //         this._super.apply(arguments);
        //
        //         var property = this.property;
        //         var model = this.model;
        //         var eventName = 'change:' + property;
        //
        //         this.listenTo(model, eventName, this.invoke);
        //     },
        //
        //     invoke: function() {
        //         var model = this.model;
        //         var property = this.property;
        //         var value = model.get(property);
        //         var selector = this.selector;
        //         var $el = (!selector) ? this.$el : this.$(selector);
        //         var scope = this.scope || this;
        //         var fn = this.fn;
        //
        //         fn.apply(scope, [$el, value]);
        //     }
        // });

        // /**
        //  *
        //  * @param {*} scope
        //  * @param {Model} model
        //  * @param {String} property
        //  * @param {String} selector
        //  * @param {function} fn
        //  */
        // function AbstractBinding(scope, model, property, selector, fn) {
        //     scope.listenTo(model, 'change:' + property, function (model) {
        //         var value = model.get(property);
        //         var $el = (!selector) ? this.$el : this.$(selector);
        //
        //         fn.apply(this, [$el, value]);
        //     }, scope);
        // }
        //
        // /**
        //  *
        //  * @param {*} scope
        //  * @param {Model} model
        //  * @param {String} property
        //  * @param {String} selector
        //  * @param {String} className
        //  * @param {function} [predicateFn]
        //  */
        // function ClassNameBinding(scope, model, property, selector, className, predicateFn) {
        //     if (!predicateFn) {
        //         predicateFn = function (value) {
        //             return !!value;
        //         }
        //     }
        //
        //     AbstractBinding(scope, model, property, selector, function ($el, value) {
        //         $el.toggleClass(className, predicateFn.call(this, value));
        //     });
        // }
        //
        // /**
        //  *
        //  * @param {*} scope
        //  * @param {Model} model
        //  * @param {String} property
        //  * @param {String} selector
        //  */
        // function CheckboxBinding(scope, model, property, selector) {
        //     AbstractBinding(scope, model, property, selector, function ($el, currentValue) {
        //         var existingValue = $el.prop('checked');
        //
        //         if (existingValue !== currentValue) {
        //             $el.prop('checked', currentValue);
        //         }
        //     });
        // }
        //
        // /**
        //  *
        //  * @param {*} scope
        //  * @param {Model} model
        //  * @param {String} property
        //  * @function
        //  * @return
        //  */
        // function ConsoleBinding(scope, model, property) {
        //     AbstractBinding(scope, model, property, null, function ($el, currentValue) {
        //         console.log('PROPERTY', property, '=', currentValue);
        //     });
        // }

        /**
         * @class AbstractBinding
         * @extends Backbone.Events
         */
        var AbstractBinding = Object.extend({

            eventSource: null,

            eventName: null,

            /**
             *
             * @param {Object} options
             * @param {Backbone.Events} options.eventSource
             * @param {String} options.eventName
             * @constructor
             */
            initialize: function(options) {
                $.extend(this, options);

                this._super(options);
            },

            start: function() {
                console.log('listenTo', this.eventSource, this.eventName);
                this.listenTo(this.eventSource, this.eventName, this.invoke);

                return this;
            },

            stop: function() {
                this.stopListening(this.eventSource, this.eventName);

                return this;
            },

            invoke: function() {
                console.log('INVOKE>', this.eventName);
            }
        });

        /**
         * @class SimpleBinding
         * @extends AbstractBinding
         */
        var SimpleBinding = AbstractBinding.extend({

            /**
             * @type {View}
             */
            view: null,

            /**
             * @type {Model|Object|Collection}
             */
            model: null,

            /**
             * @type {String}
             */
            propertyName: null,

            /**
             * @type {String}
             */
            selector: null,

            /**
             *
             * @param {Object} options
             * @param {View} options.view
             * @param {Model} options.model
             * @param {String} options.propertyName
             * @constructor
             */
            initialize: function(options) {
                options.eventSource = options.model || options.eventSource;
                options.eventName = options.propertyName ? ('change:' + options.propertyName) : options.eventName;

                this._super(options);

                if (!this.model) {
                    throw new Error('We cannot run without a model')
                }

                if (!this.propertyName) {
                    throw new Error('We cannot run without a propertyName');
                }

                this.log('BINDER.init()', this);
            },

            getElement: function() {
                var $el = this.view.$el;
                var selector = _.result(this, 'selector');

                if (selector) {
                    return $el.find(selector);
                } else {
                    return $el;
                }
            },

            /**
             *
             * @param {jQuery} $el
             * @returns {*}
             */
            getElementValue: function($el) {
                return $el.val() || $el.text();
            },

            getModelValue: function() {
                return this.model.get(this.propertyName);
            },

            /**
             * @param {jQuery} $el
             * @param {*} value
             *
             * @returns {boolean}
             */
            predicateFn: function($el, value) {
                return this.getElementValue($el) !== value;
            },

            /**
             *
             * @param {jQuery} $el
             * @param {*} value
             */
            setElementValue: function($el, value) {
                $el.html(value);
            },

            invoke: function() {
                var $el = this.getElement();
                var currentValue = this.getModelValue();
                var predicateValue = this.predicateFn($el, currentValue);

                if (!_.isBoolean(predicateValue)) {
                    throw new Error('The predicateFn returned a non-boolean: ' + predicateValue);
                }

                this.log('invoke>', $el, currentValue, predicateValue);

                if (predicateValue) {
                    this.setElementValue($el, currentValue);
                }
            }
        });

        /**
         * @class ClassNameBinding
         * @exends SimpleBinding
         */
        var ClassNameBinding = SimpleBinding.extend({

            /**
             * @type {String}
             */
            className: null,

            /**
             * @param {Object} options
             * @param {View} options.view
             * @param {Model} options.model
             * @param {String} options.className
             * @param {String} options.propertyName
             * @constructor
             */
            initialize: function(options) {
                this._super(options);

                // force an error
                this.getClassName();
            },

            /**
             *
             * @param {jQuery} $el
             * @param {*|Boolean} value
             */
            setElementValue: function($el, value) {
                var className = this.getClassName();

                this.log('toggleClass', className, value);

                $el.toggleClass(className, value);
            },

            predicateFn: function($el, value) {
                return !!value;
            },

            /**
             *
             * @param {jQuery} $el
             * @returns {*}
             */
            getElementValue: function($el) {
                return $el.hasClass(this.getClassName());
            },

            getClassName: function() {
                var className = _.result(this, 'className');

                if(!className) {
                    throw new Error('Must have a className defined');
                }

                return className;
            },

            invoke: function() {
                var $el = this.getElement();
                var value = this.getModelValue();
                var predicateValue = this.predicateFn($el, value);

                this.setElementValue($el, predicateValue);
            }
        });

        /**
         * @class CheckboxBinding
         */
        var CheckboxBinding = SimpleBinding.extend({

            /**
             *
             * @param {Object} options
             * @param {View} options.view
             * @param {Model} options.model
             * @param {String} options.propertyName
             * @constructor
             */
            initialize: function(options) {
                this._super(options);
            },

            /**
             *
             * @param {jQuery} $el
             * @param {*} value
             */
            setElementValue: function($el, value) {
                $el.prop('checked', value);
            },

            /**
             *
             * @param {jQuery} $el
             * @returns {*}
             */
            getElementValue: function($el) {
                return $el.prop('checked');
            }
        });

        /**
         * This class assumes that the parent is a View
         *
         * @class Binding
         * @extends Plugin
         */
        var BinderPlugin = Plugin.extend({

            /**
             * @type {Array}
             */
            bindings: null,


            initEl: function() {
                this.stopBindings();

                this.startBindings();
            },

            startBindings: function() {
                _.each(this.bindings, function(binding) {
                    if (!binding) {
                        return;
                    }

                    binding.start();
                });
            },

            stopBindings: function() {
                // _.each(this.bindings, function(binding) {
                //     if (!binding) {
                //         return;
                //     }
                //
                //     binding.stop();
                // });
            },

            attach: function() {
                this._super.apply(this, arguments);

                this.listenTo(this.parent, 'initEl', this.initEl);

                var view = this.view || this.parent;
                var model = this.model || this.parent.model;
                var type = this.type;

                this.bindings = _.map(this.bindings, function(/** @type {AbstractBinding|Object} */ bindingConfigOrObject) {
                    if (bindingConfigOrObject instanceof AbstractBinding) {
                        return bindingConfigOrObject;
                    }

                    /**
                     * @type {Object}
                     */
                    var config = bindingConfigOrObject;

                    /**
                     * @type {String}
                     */
                    var type = (_.result(config, 'type').toLowerCase());
                    var propertyName = _.result(config, 'propertyName');
                    var selector = _.result(config, 'selector');

                    /**
                     * @param {Object} options
                     * @param {View} options.view
                     * @param {Model} options.model
                     * @param {String} options.propertyName
                     */
                    var options = _.assign({
                        view: view,
                        model: model,
                        propertyName: propertyName
                    }, config);

                    var BindingType;

                    if ('checkbox' === type) {
                        BindingType = CheckboxBinding;
                    } else if ('console' === type) {
                        BindingType = ConsoleBinding;
                    } else if ('classname' === type) {
                        BindingType = ClassNameBinding;
                    }

                    if (!BindingType) {
                        throw new Error('Not able to do anything with this config' + config);
                    }

                    return new BindingType(options);
                }, this);
            },

            destroy: function() {
                this._super();
            }
        });

        // this.addPlugin(new BinderPlugin({
        //
        //     bindings: [{
        //         type: 'Checkbox',
        //         selector: '.checkbox-use-parent-value',
        //         eventName: 'usingParentValue',
        //         predicateFn: function() {
        //             return true;
        //         }
        //     }]
        // }));

        /**
         * @type {ConsoleBinding}
         */
        var ConsoleBinding = SimpleBinding.extend({

            /**
             * @param {jQuery} $el
             * @param {*} value
             *
             * @returns {boolean}
             */
            predicateFn: function($el, value) {
                return true;
            },

            /**
             *
             * @param {jQuery} $el
             * @param {*} value
             */
            setElementValue: function($el, value) {
                console.log('BINDING>', $el, '->', value);
            }
        });

        /**
         * @class Bindings
         */
        return {
            /**
             * @static
             * @type {BinderPlugin}
             */
            'BinderPlugin': BinderPlugin,

            /**
             * @static
             * @type {AbstractBinding}
             */
            'AbstractBinding': AbstractBinding,

            /**
             * @static
             * @type {SimpleBinding}
             */
            'SimpleBinding': SimpleBinding,

            /**
             * @type {ConsoleBinding}
             * @static
             */
            'ConsoleBinding': ConsoleBinding,

            /**
             * @static {Function}
             * @type {ClassNameBinding}
             */
            'ClassNameBinding': ClassNameBinding,

            /**
             * @static
             * @type {CheckboxBinding}
             */
            'CheckboxBinding': CheckboxBinding
        }
    });
