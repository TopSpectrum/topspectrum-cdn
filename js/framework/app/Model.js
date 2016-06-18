'use strict';

define(['underscore', 'backbone', 'jquery'],

    /**
     *
     * @param {UnderscoreStatic} _
     * @param {Backbone} Backbone
     * @param {Backbone.Model} Backbone.Model
     * @param {function} Backbone.Model.extend
     * @param {jQuery} $
     * @returns {*}
     */
    function (_, Backbone, $) {

    /**
     * @class Model
     */
    var Model = Backbone.Model.extend({

        computed: undefined,

        /**
         * @type {Object}
         */
        schema: undefined,

        setters: undefined,

        getters: undefined,

        initialize: function () {

            // Let's build the
            this.on('change', function () {
                var i, changedAttributes = this.changedAttributes() || [];
                _.each(this.attributes, function (value, key) {
                    if (_.isFunction(value) && _.isArray(value.attributes)) {
                        for (i in value.attributes) {
                            if (_.has(changedAttributes, value.attributes[i])) {
                                this.trigger("change:" + key);
                                return;
                            }
                        }
                    }
                }, this);
            }, this);
        },

        /**
         *
         * @param {String|Object} key
         * @param {*} value
         * @param {Object} options
         * @returns {Model}
         */
        set: function(key, value, options) {
            var attrs, attr;

            // Normalize the key-value into an object
            if (_.isObject(key) || key == null) {
                attrs = key;
                options = value;
            } else {
                attrs = {};
                attrs[key] = value;
            }

            // always pass an options hash around. This allows modifying
            // the options inside the setter
            options = options || {};

            // Go over all the set attributes and call the setter if available
            if (this.setters) {
                for (attr in attrs) {
                    if (!attrs.hasOwnProperty(attr)) {
                        continue;
                    }

                    if (_.isFunction(this.setters[attr])) {
                        attrs[attr] = this.setters[attr].call(this, attrs[attr], options);
                    }
                }
            }

            return this._super.call(this, attrs);
        },

        get: function(attr) {
            var value;

            // Call the getter if available
            if (this.getters && _.isFunction(this.getters[attr])) {
                value = this.getters[attr].call(this);
            } else {
                value = this._super.apply(this, arguments);
            }

            if (!value) {
                return value;
            }

            if (_.isFunction(value)) {
                return value.call(this);
            }

            if (value.computedFunction) {
                return value.computedFunction.call(this);
            }

            return value;
        },

        /**
         *
         * @param {Boolean} [restrictedToSchema]
         * @returns {any}
         */
        toJSON: function (restrictedToSchema) {
            /**
             * @type {Object}
             */
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments) || {};
            var schema = this.schema;

            return _.omit(json, function(value, key, object) {
                if (typeof value == 'function') {
                    return true;
                }

                if (restrictedToSchema) {
                    if (schema && !schema[key]) {
                        return true;
                    }
                }

                return false;
            });
        }
    });

    Model.computed = function () {
        // varargs string
        var len = arguments.length;
        var attributes = _.head(arguments, len - 1);
        var fn = _.last(arguments);
        fn.attributes = attributes;

        return fn;
    };

    Model.parse = function ($modelEl) {
        if (!$modelEl || !$modelEl.is('model')) {
            throw 'Wrong model type';
        }

        var object = {};

        function htmlDecode(input) {
            var doc = new DOMParser().parseFromString(input, "text/html");
            return doc.documentElement.textContent;
        }

        var decoders = {
            html: function (value) {
                if (!value) {
                    return null;
                }

                return htmlDecode(value);
            },

            json: function (value) {
                if (!value) {
                    return null;
                }

                if (!_.isString(value)) {
                    debugger;
                }

                value = htmlDecode(value);
                if (_.isString(value)) {
                    return JSON.parse(value);

                } else {
                    debugger;
                }
            },

            boolean: function(value) {
                if ('false' === value) {
                    return false;
                } else if ('true' === value) {
                    return true;
                }

                return !!value;
            },

            none: function (value) {
                return value;
            },

            string: function (value) {
                return value;
            },

            url: function (value) {
                return value;
            },

            number: function(value) {
                return parseFloat(value);
            },

            hidden: function (value) {
                return value;
            }
        };

        /**
         *
         * @param {jQuery} $field
         * @returns {Object}
         */
        function resolver($field) {

            function readSpec($field) {
                var html = $field.html();
                var data = $field.data();
                var result;

                if ($.isEmptyObject(data)) {
                    data = null;
                }

                if (html) {
                    if (data) {
                        return _.extend({
                            value: html
                        }, data);
                    } else {
                        return html;
                    }
                } else {
                    if (data) {
                        result = _.extend({}, data);

                        if (html) {
                            _.extend(result, {
                                value: html
                            });
                        }

                        return result;
                    }
                }
            }

            var spec = readSpec($field);

            if (spec) {
                /**
                 * @type {function}
                 */
                var decoder = decoders[spec.type || 'none'];

                if (!decoder) {
                    throw new Error('Could not find decoder for ' + spec.type);
                }

                if (spec.value) {
                    spec.value = decoder(spec.value);
                } else {
                    if (_.isString(spec)) { // TODO: support numbers?
                        spec = decoder(spec);
                    }
                }
            }

            return spec;
        }

        /**
         *
         * @param {null|Object} spec
         * @param {undefined|String} spec.type
         * @param {undefined|String} spec.value
         * @param {undefined|String} spec.encoding
         * @returns {null|Object}
         */
        function decoder(spec) {
            if (!spec) {
                return spec;
            }

            if ('json' === spec.encoding) {
                spec.value = JSON.parse(spec.value);
            }

            return spec;
        }

        $modelEl.find('property').each(function () {
            var $field = $(this);
            var key = $field.attr('key');
            var type = $field.attr('type') || 'autodetect';
            var spec = resolver($field);

            object[key] = decoder(spec);
        });

        return new Backbone.Model(object);
    };

    return Model;
});