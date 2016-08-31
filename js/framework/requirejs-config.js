"use strict";

define('document', [], function () {
    return document;
});

define('window', [], function () {
    return window;
});

define('jquery', [], function () {
    return jQuery;
});

define('underscore', function () {
    return _;
});

define('backbone', function () {
    return Backbone;
});

define('Backbone', function () {
    return Backbone;
});

if (window.Ts) {
    define('Ts', function () {
        return window.Ts;
    });
}

define('jstz', function () {
    return jstz;
});

define('moment', ['jstz'], function (jstz) {
    moment.CUR_TIMEZONE = jstz.determine().name();
    moment.tz.setDefault(moment.CUR_TIMEZONE);

    return moment;
});

define('Handlebars', ['moment'], function (moment) {
    var DateFormats = {
        short: "ll",
        long: "MMMM Do YYYY, h:mm:ss A (z)",
        raw: "x",
        ago: "ago"
    };

    Handlebars.registerHelper('json', function(json) {

        //Thanks to: http://jsfiddle.net/KJQ9K/
        function highlightSyntax(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }

        function pre(string) {
            return new Handlebars.SafeString('<pre class="pretty-json">' + string + '</pre>');
        }

        try {
            return pre(highlightSyntax(JSON.stringify(json, null, 4)));
        } catch (exc) {
            return pre("Failed to parse input obj:\n" + json);
        }
    });

    Handlebars.registerHelper('typeOf', function(value) {
        return (typeof value);
    });

    Handlebars.registerHelper('ifImageAttachment', function (options) {
        var attachment = this;

        var mimeType = attachment.mediaType;
        if (!mimeType) {
            return '';
        }

        return options.fn(this);
    });

    Handlebars.registerHelper('defaultValue', function(left, right) {
        if (!left) {
            return right;
        } else {
            return left;
        }
    });

    // Use UI.registerHelper..
    Handlebars.registerHelper("formatDate", function (datetime, format) {
        if (!datetime) {
            return datetime;
        }

        if (moment) {
            // can use other formats like 'lll' too
            format = DateFormats[format] || format;

            if (!format) {
                format = DateFormats.short;
            }

            var time = moment(datetime).tz(moment.CUR_TIMEZONE);

            if (format === 'ago') {
                return time.fromNow();
            } else {
                return time.format(format);
                //return moment().tz(datetime, moment.CUR_TIMEZONE).format(format);
            }
        }
        else {
            return datetime;
        }
    });

    Handlebars.registerHelper("inc", function (value, options) {
        return parseInt(value) + 1;
    });

    /*
     * Repeat given markup with given times
     * provides @index for the repeated iteraction
     */
    Handlebars.registerHelper("repeat", function (times, opts) {
        var out = "";
        var i;
        var data = {};

        if (times) {
            for (i = 0; i < times; i += 1) {
                data.index = i;
                out += opts.fn(this, {
                    data: data
                });
            }
        } else {

            out = opts.inverse(this);
        }

        return out;
    });

    return Handlebars;
});

define('handlebars', ['Handlebars'], function (Handlebars) {
    return Handlebars;
});

define('Ladda', ['require', 'jquery'], function (require, $) {
    var Ladda = window.Ladda;

    /*!
     * Ladda for jQuery
     * http://lab.hakim.se/ladda
     * MIT licensed
     *
     * Copyright (C) 2015 Hakim El Hattab, http://hakim.se
     */

    (function (Ladda, $) {
        if ($ === undefined)
            return console.error('jQuery required for Ladda.jQuery');

        var arr = [];

        $ = $.extend($, {
            ladda: function (arg) {
                if (arg === 'stopAll')
                    Ladda.stopAll();
            }
        });

        $.fn = $.extend($.fn, {
            ladda: function (arg) {
                var args = arr.slice.call(arguments, 1);

                if (arg === 'bind') {
                    args.unshift($(this).selector);
                    Ladda.bind.apply(Ladda, args);
                } else {
                    $(this).each(function () {
                        var $this = $(this),
                            ladda = $this.data('ladda');

                        if (!ladda) {
                            ladda = Ladda.create(this);
                            $this.data('ladda', ladda);
                        }

                        if (arg !== undefined) {
                            ladda[arg].apply(ladda, args);
                        }
                    });
                }

                return this;
            }
        });
    }(window.Ladda, $));

    return Ladda;
});

define("optional", [], {
    load: function (moduleName, parentRequire, onload, config) {

        var onLoadSuccess = function (moduleInstance) {
            // Module successfully loaded, call the onload callback so that
            // requirejs can work its internal magic.
            onload(moduleInstance);
        };

        var onLoadFailure = function (err) {
            // optional module failed to load.
            var failedId = err.requireModules && err.requireModules[0];
            console.warn("Could not load optional module: " + failedId);

            // Undefine the module to cleanup internal stuff in requireJS
            requirejs.undef(failedId);

            // Now define the module instance as a simple empty object
            // (NOTE: you can return any other value you want here)
            define(failedId, [], function () {
                return {};
            });

            // Now require the module make sure that requireJS thinks
            // that is it loaded. Since we've just defined it, requirejs
            // will not attempt to download any more script files and
            // will just call the onLoadSuccess handler immediately
            parentRequire([failedId], onLoadSuccess);
        };

        parentRequire([moduleName], onLoadSuccess, onLoadFailure);
    }
});

// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({

    baseUrl: '/assets/js/lib',

    shim: {
        jscroll: ['jquery'],

        backgrid: {
            deps: ['jquery', 'backbone', 'underscore'],
            exports: 'Backgrid'
        },

        url: {
            exports: 'Url'
        },

        'bootstrap-rating': {
            deps: ['jquery']
        },

        'fileupload': {
            deps: [
                'css!//cdn.feedback/js/jasny-bootstrap.min.css',
                'jquery.fileupload-image',
                'jquery.iframe-transport',
                'canvas-to-blob',
                'load-image',
            ]
        },

        //'fileupload': {
        //    deps: [
        //        '//cdn.feedback/js/load-image.all.min.js',
        //        '//cdn.feedback/js/canvas-to-blob.min.js',
        //        '//cdn.feedback/js/jquery.iframe-transport.js',
        //        '//cdn.feedback/js/jquery.fileupload.js',
        //        '//cdn.feedback/js/jquery.fileupload-process.js',
        //        '//cdn.feedback/js/jquery.fileupload-image.js'
        //    ]
        //},

        'selectize': {
            deps: ['css!//cdn.feedback/js/selectize/0.12.1/selectize.default.css']
        },

        'FloatLabel': {
            deps: ['css!//cdn.feedback/js/float-label/FloatLabel.css']
        },

        "backgrid/select-all": ['backgrid']
    },

    paths: {
        // Maybe in prod this should be:  'app': '../app-built'
        'app': '../app',

        'reviews': '../app/reviews', // This is misplaced and belongs in default.feedback

        '//cdn.feedback/js/load-image.all.min.js' : '//cdn.feedback/js/load-image.all.min',
        '//cdn.feedback/js/canvas-to-blob.min.js' : '//cdn.feedback/js/canvas-to-blob.min',
        '//cdn.feedback/js/jquery.iframe-transport.js' : '//cdn.feedback/js/jquery.iframe-transport',
        '//cdn.feedback/js/jquery.fileupload.js' : '//cdn.feedback/js/jquery.fileupload',
        '//cdn.feedback/js/jquery.fileupload-process.js' : '//cdn.feedback/js/jquery.fileupload-process',
        '//cdn.feedback/js/jquery.fileupload-image.js': '//cdn.feedback/js/jquery.fileupload-image',

        'spinner': '//cdn.feedback/js/spin.min',

        'load-image-exif' : '//cdn.feedback/js/load-image-exif-2.1.0',
        'load-image-ios' : '//cdn.feedback/js/load-image-ios-2.1.0',
        'load-image-orientation' : '//cdn.feedback/js/load-image-orientation-2.1.0',
        'load-image-meta' : '//cdn.feedback/js/load-image-meta-2.1.0',
        'load-image' : '//cdn.feedback/js/load-image-2.1.0',
        'jquery.fileupload' : '//cdn.feedback/js/jquery.fileupload',
        'jquery.fileupload-image': '//cdn.feedback/js/jquery.fileupload-image',
        'jquery.fileupload-process' : '//cdn.feedback/js/jquery.fileupload-process',
        'jquery.autogrowtextarea' : '//cdn.feedback/js/jquery.autogrowtextarea-3.0.0',
        'fileupload' : '//cdn.feedback/js/jquery.fileupload-validate',
        'jquery.iframe-transport': '//cdn.feedback/js/jquery.iframe-transport',
        'canvas-to-blob' : '//cdn.feedback/js/canvas-to-blob.min',
        // 'jstz' : '//cdn.feedback/js/jstz-1.0.4.min',
        // 'moment' : '//cdn.feedback/js/moment-2.9.0.min',

        // Supporting utilities
        'backgrid': '//cdn.feedback/js/backgrid/0.3.5/backgrid',
        'backgrid/select-all': '//cdn.feedback/js/backgrid/0.3.5/backgrid.extension.selectall',
        'backbone.pageable': '//cdn.feedback/js/backbone.paginator-2.0.0',
        'sifter': '//cdn.feedback/js/sifter-0.4.5.min',
        'microplugin': '//cdn.feedbload-imageack/js/microplugin-0.0.3.min',
        'jscroll': '//cdn.feedback/js/jquery.jscroll-2.3.4',
        'jqueryui': '//cdn.feedback/js/jquery-ui-1.11.4',
        'jquery.ui.widget': '//cdn.feedback/js/jquery.ui.widget-1.11.4',
        'position-calculator': '//cdn.feedback/js/position-calculator-1.1.2',
        'selectize': '//cdn.feedback/js/selectize/0.12.1/selectize.standalone',
        'FloatLabel': '//cdn.feedback/js/float-label/FloatLabel',
        'bootstrap-rating': '//cdn.feedback/js/bootstrap-rating',
        'validator': '//cdn.feedback/js/customized/validator-0.8.0',
        'mousetrap': '//cdn.feedback/js/mousetrap.min',
        'text': '//cdn.feedback/js/framework/lib/text',
        'jquery.payment': '//cdn.feedback/js/jquery.payment-1.3.0',

        'Ts': '//cdn.feedback/js/topspectrum-0.1',

        'url': '//cdn.feedback/js/url-2.1.0.min',
        'URI': '//cdn.feedback/js/urijs-1.18.1.min',
        // 'gmap': '//cdn.feedback/js/googlemaps',

        // common-plugins.js
        'AutowirePlugin': '//cdn.feedback/js/framework/plugins/AutowirePlugin',
        'HotkeyShimPlugin': '//cdn.feedback/js/framework/plugins/HotkeyShimPlugin',

        // "framework.js"
        'app/Object': '//cdn.feedback/js/framework/app/Object',
        'app/Model': '//cdn.feedback/js/framework/app/Model',
        'app/Collection': '//cdn.feedback/js/framework/app/Collection',
        'app/Plugin': '//cdn.feedback/js/framework/app/Plugin',
        'app/Feature': '//cdn.feedback/js/framework/app/Feature',
        'app/Application': '//cdn.feedback/js/framework/app/Application',

        'bluebird': '//cdn.jsdelivr.net/bluebird/3.4.1/bluebird.min',
        'Promise': '//cdn.jsdelivr.net/bluebird/3.4.1/bluebird.min',
        'ui/View': '//cdn.feedback/js/framework/ui/View',
        'ui/Widget': '//cdn.feedback/js/framework/ui/Widget',
        'ui/Modal': '//cdn.feedback/js/framework/ui/Modal',
        'ui/Grid': '//cdn.feedback/js/framework/ui/Grid',
        'ui/Action': '//cdn.feedback/js/framework/ui/Action',
        'ui/Bindings': '//cdn.feedback/js/framework/ui/Bindings'
    },

    packages: [{
        name: 'hbs',
        location: '//cdn.feedback/js/framework/lib',
        main: 'hbs'
    }, {
        name: 'async',
        location: '//cdn.feedback/js/framework/lib',
        main: 'async'
    }],

    map: {
        '*': {
            'css': 'https://cdnjs.cloudflare.com/ajax/libs/require-css/0.1.8/css.js'
        }
    },

    hbs: {
        templateExtension: ".html"
    }
});

/**
 * Taken from: http://www.hiddentao.com/archives/2011/06/23/requirejs-with-progress-indicator/
 */
window.require_proxy = {
    i: 0,
    start: function() {},
    stop: function() {},
    incr: function() {
        this.i++;

        if (1 === this.i) {
            this.start();
        }
    },

    decr: function() {
        this.i--;

        if (0 >= this.i) {
            this.i = 0;
            this.stop();
        }
    }
};

if (window.require) {
    window.require = (function () {
        var orig_require = window.require;

        return function (_list, _callback) {
            var callback_fn = function (_args) {
                _callback.apply(null, _args);
            };

            window.require_proxy.incr();

            orig_require.call(null, _list, function () {
                try {
                    window.require_proxy.decr();
                } finally {
                    callback_fn(arguments);
                }
            });
        }
    })();
}

if (window.define) {
    window.define = (function () {
        var fn = window.define;

        window.bullshit = fn;

        var result = function (functionArrayOrString, arrayOrFunctionOrUndefined, functionOrUndefined) {

            window.require_proxy.incr();

            var scope = this;

            function wrapper(fn2) {
                var args = _.rest(arguments, 1);
                var result = fn2.apply(scope, args);

                window.require_proxy.decr();

                return result;
            }

            if (_.isFunction(functionArrayOrString)) {
                var f = _.wrap(functionArrayOrString, wrapper);

                return fn.call(null, f);
            } else if (_.isFunction(arrayOrFunctionOrUndefined)) {
                var f = _.wrap(arrayOrFunctionOrUndefined, wrapper);

                return fn.call(null, functionArrayOrString, f);
            } else if (_.isFunction(functionOrUndefined)) {
                var f = _.wrap(functionOrUndefined, wrapper);

                return fn.call(null, functionArrayOrString, arrayOrFunctionOrUndefined, f);
            }
        };

        result.amd = window.define.amd;

        return result;
    })();
}

// $(document).ready(function() {
//     require(['jquery', 'app/Application'], function($, Application) {
//         window.require_proxy.start = function() {
//             Application.trigger('requirejs:start');
//         };
//
//         window.require_proxy.stop = function() {
//             Application.trigger('requirejs:stop');
//         };
//     });
// });