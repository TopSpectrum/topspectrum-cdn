/**
 * This file assumes that you are running:
 *
 *  - Underscore
 *  - Backbone
 *  - Handlebars
 *  - jQuery (including all the TopSpectrum plugins)
 *
 * @type {{}}
 */
var Ts = {
    ensureFn: function(fn) {
        if (!fn) {
            return this.emptyFn;
        }

        return fn;
    },

    emptyFn: function() {

    },

    namespace : function() {

        var argsLen = arguments.length;

        for(var i = 0; i < argsLen; i++){
            var arg = arguments[i];
            if (!_.isString(arg))
                continue;

            var parts = arg.split('.');

            if (!parts) {
                return;
            }

            var partsLen = parts.length;
            var obj = window;
            for(var j = 0; j < partsLen; j++){
                var thing = obj[parts[j]];

                if (!thing) {
                    thing = obj[parts[j]] = {};
                }

                obj = thing;
            }
        }
    }
};

