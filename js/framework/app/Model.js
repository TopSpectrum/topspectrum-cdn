'use strict';

define(['underscore', 'backbone', 'jquery'],

    /**
     *
     * @param {underscore} _
     * @param {Backbone} Backbone
     * @param {jQuery} $
     * @returns {*}
     */
    function (_, Backbone, $) {

    /**
     * @class Model
     */
    var Model = Backbone.Model.extend({

        computed: undefined,

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
        get: function (attr) {
            var value = Backbone.Model.prototype.get.call(this, attr);
            return _.isFunction(value) ? value.call(this) : value;
        },
        toJSON: function () {
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            _.each(json, function (value, key) {
                if (typeof value == 'function') {
                    delete json[key];
                }
            });
            return json;
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