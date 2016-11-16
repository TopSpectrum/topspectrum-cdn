
function assert(e) {
    if (e) {
        console.trace();
        throw 'should not exist: ' + e;
    }
}

(function ($) {

    $.ensureFn = function (fn) {
        if (!fn || $.type(fn) !== 'function') {
            return this.emptyFn;
        }

        return fn;
    };


    /**
     * Null-safe way to get the first element from an array.
     */
    $.first = function (e) {
        if (!e) {
            return null;
        }

        if (!e.length) {
            return null;
        }

        return e[0];
    };

    $.emptyFn = function () {
    };

    $.ensureObj = function (value) {
        if (!value) {
            return {};
        }

        return value;
    };

    $.defaultValue = function (value1, value2) {
        if (!value1) {
            return value2;
        }

        return value1;
    };

    $.listener = function(fn, scope, optionalArgs) {
        return function(e) {
            e.preventDefault();

            fn.call(scope||this, optionalArgs);
        }
    };

    /**
     * Optional extend (as opposed to jQuery's default $.extend method, which is forced)
     *
     * @param obj1
     * @param obj2
     * @returns {void|*}
     */
    $.extendIf = function (obj1, obj2) {
        return $.extend(true, {}, obj2, obj1);
    };

    /**
     * Copies all the properties of config to object if they don't already exist.
     * @param {Object} object The receiver of the properties
     * @param {Object} config The source of the properties
     * @return {Object} returns obj
     */
    $.applyIf = function(object, config) {
        var property;
        if (object) {
            for (property in config) {
                var o = object[property];
                if (o === undefined || o === null) {
                    object[property] = config[property];
                }
            }
        }

        return object;
    };

}(jQuery));

(function ($) {

    $.namespace = function () {

        var argsLen = arguments.length;

        for (var i = 0; i < argsLen; i++) {
            var arg = arguments[i];
            if (!_.isString(arg))
                continue;

            var parts = arg.split('.');

            if (!parts) {
                return;
            }

            var partsLen = parts.length;
            var obj = window;
            for (var j = 0; j < partsLen; j++) {
                var thing = obj[parts[j]];

                if (!thing) {
                    thing = obj[parts[j]] = {};
                }

                obj = thing;
            }
        }
    }

}(jQuery));

(function ($) {

    $.log = function () {
        var console = window.console;
        var debug = window.debug;

        if (debug && console && console.log) {
            console.log.apply(console, arguments);
        }

        if (arguments) {
            return arguments[0];
        }
    };

    $.true = function (value) {
        return (value === true) ? true : false;
    };

    $.checkArg = function (value, type, defaultValue) {
        if ($.isBlank(value)) {
            value = defaultValue;
        }

        var existingType = $.type(value);

        if (!(existingType === type)) {
            throw 'Type should have been [' + type + '] but was [' + existingType + ']';
        }

        return value;
    };

    $.checkExists = function (e) {
        if ($.isBlank(e)) {
            throw 'Should exist, but is blank: ' + e;
        }

        return e;
    };

    $.scope = function (e, defaultScope) {
        return (e || defaultScope) || this;
    };

    $.config = function (args, defaultValues) {
        return $.extendIf(args, defaultValues);
    };

    /**
     *
     * args = { buffer: number }
     *
     * @param eventName
     * @param fn
     * @param scope
     * @param args
     */
    $.fn.listenTo = function (eventName, fn, scope, args) {
        scope = $.scope(scope);
        fn = $.ensureFn(fn);
        args = $.config(args, {
            buffer: false
        });

        if (args.buffer) {
            $.log('debounce', fn);
            fn = $.debounce(args.buffer, $.proxy(fn, scope));
            $.log('debounce2', fn);
        }

        $.log('on', eventName);

        this.on(eventName, function (e) {
            if (args.preventDefault) {
                $.log('prevent');
                e.preventDefault();
            }

            $.log('run', fn, scope, arguments);

            fn.call(scope, arguments);
        });
    }

    $.fn.equals = function(compareTo) {
        if (!compareTo || this.length != compareTo.length) {
            return false;
        }
        for (var i = 0; i < this.length; ++i) {
            if (this[i] !== compareTo[i]) {
                return false;
            }
        }
        return true;
    };

}(jQuery));

(function ($) {
    
    $.formData = function ($form) {
        var paramObj = {};
        $.each($form.serializeArray(), function (_, kv) {
            paramObj[kv.name] = kv.value;
        });
        return paramObj;
    };

    $.formAjaxArgs = function ($form, optionalExtras, requiredExtras) {
        return $.extendIf(
            $.extend(true, {
                    url: $form.attr('action'),
                    method: $form.attr('method'),
                    data: $.formData($form)
                }, requiredExtras
            ), optionalExtras);
    };

    $.fn.ajax = function (requiredArgs, optionalArgs) {
        var $this = this;

        // This is really for forms....
        var args = $.formAjaxArgs(this, optionalArgs, requiredArgs);

        $.log('form ajax args', args);

        return $.ajax(args);
    };

    $.fn.keybind = function (fn, scope) {
        return this.on('keypress keydown keyup', $.debounce(100, $.proxy($.ensureFn(fn), $.scope(scope, this))));
    };

    //$.fn.class = function (clazz, value) {
    //    if (value) {
    //        this.addClass(clazz);
    //    } else {
    //        this.removeClass(clazz);
    //    }
    //};

    $.fn.disable = function (value) {
        if (_.isUndefined(value)) {
            value = true;
            //return this.attr('disabled');
        }

        value = $.true(value);

        this.attr('disabled', value);

        if (value) {
            this.addClass('disabled');
        } else {
            this.removeClass('disabled');
        }
    };

    $.trueOrThrow = function (value) {
        if (!$.true(value)) {
            throw 'Should be true, was [' + value + ']';
        }
        return value;
    };

    $.fn.declasse = function (re) {
        return this.each(function () {
            var c = this.classList;
            if (!c) return;
            for (var i = c.length - 1; i >= 0; i--) {
                var classe = "" + c[i];
                if (classe.match(re)) {
                    c.remove(classe)
                }
            }
        });
    };

    /**
     * null = true
     * undefined = true
     * empty string = true
     * string with spaces = true
     * empty object = true
     * zero = true
     *
     * @param val
     * @returns {boolean}
     */
    $.isBlank = function (val) {
        if (_.isUndefined(val) || _.isNull(val)) {
            return true;
        } else if (_.isString(val)) {
            return val.trim() === '';
        } else if (_.isNumber(val)) {
            return val === 0;
        } else if (_.isEmpty(val)) {
            return true;
        }

        return false;
    };

    $.stringExists = function(value) {
        return ($.stringLength(value) >= 1);
    };

    /**
     * Null-safe way to trim a string.
     *
     * Never returns null
     *
     * @param value
     */
    $.trim = function(value) {
        if (!value) {
            return '';
        } else if (!_.isString(value)) {
            return '';
        }

        return value.trim();
    };

    /**
     * If null or not a string, returns 0;
     *
     * @param value
     * @returns {*}
     */
    $.stringLength = function(value) {
        if (!value || !_.isString(value)) {
            return 0;
        }

        return value.length;
    };

    $.defaultString = function(value, defaultValue) {
        if ($.stringExists(value)) {
            return value;
        }

        return $.stringExists(defaultValue) ? defaultValue : '';
    };

    $.fn.toggleClassGroup = function(baseName, suffix) {
        var prefix = baseName + '-';
        var fullIconName = prefix + $.defaultString(suffix);

        this.declasse(new RegExp(prefix));
        this.addClass(baseName);
        this.addClass(fullIconName);

        return this;
    };

    $.fn.icon = function(baseName, iconName) {
        return this.toggleClassGroup(baseName, iconName);
    };

    $.fn.setTextOrValue = function(text) {
        this.each(function() {
            var $el = $(this);
            var attr = $el.attr('value');

            if (typeof attr !== 'undefined' && attr !== false) {
                $el.val(text);
            } else {
                $el.text(text);
            }
        });
    };

    $.fn.glyphicon = function (iconName) {
        return this.icon('glyphicon', iconName);
    };

}(jQuery));


