define(['backbone', 'jquery'], function(Backbone, $) {

    /**
     * @class Model
     */
    var Model = Backbone.Model.extend({

        computed: undefined,

        initialize: function(){

            // Let's build the
            this.on('change', function(){
                var i, changedAttributes = this.changedAttributes() || [];
                _.each(this.attributes, function(value, key){
                    if( _.isFunction(value) && _.isArray(value.attributes) ) {
                        for(i in value.attributes) {
                            if ( _.has(changedAttributes, value.attributes[i]) ) {
                                this.trigger("change:"+key);
                                return ;
                            }
                        }
                    }
                }, this);
            }, this);
        },
        get: function(attr) {
            var value = Backbone.Model.prototype.get.call(this, attr);
            return _.isFunction(value) ? value.call(this) : value;
        },
        toJSON: function() {
            var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
            _.each(json, function (value, key) {
                if (typeof value == 'function') {
                    delete json[key];
                }
            });
            return json;
        }
    });

    Model.computed = function() {
        // varargs string
        var len = arguments.length;
        var attributes = _.head(arguments, len - 1);
        var fn = _.last(arguments);
            fn.attributes = attributes;

        return fn;
    };

    Model.parse = function($modelEl) {
        if (!$modelEl || !$modelEl.is('model')) {
            throw 'Wrong model type';
        }

        var object = {};

        function htmlDecode(input) {
            var doc = new DOMParser().parseFromString(input, "text/html");
            return doc.documentElement.textContent;
        }

        var strategies = {
            html: function($field) {
                return htmlDecode($field.html());
            },
            json: function($field) {
                return JSON.parse(htmlDecode($field.html()));
            },
            data: function($field) {
                return $field.data();
            },
            autodetect: function($field) {
                var html = $field.html();
                var data = $field.data();

                if ($.isEmptyObject(data)) {
                    data = null;
                }

                if (html) {
                    if (data) {
                        var result = { value: html };

                        _.extend(result, data);

                        return result;
                    } else {
                        return html;
                    }
                } else {
                    if (data) {
                        var result = _.extend({}, data);

                        if (html) {
                            _.extend(result, { value: html });
                        }

                        return result;
                    }
                }
            }
        };

        $modelEl.find('property').each(function() {
            var $field = $(this);
            var key = $field.attr('key');
            var type = $field.attr('type') || 'autodetect';
            var resolver = strategies[type];

            object[key] = resolver($field);
        });

        return new Backbone.Model(object);
    };

    return Model;
});