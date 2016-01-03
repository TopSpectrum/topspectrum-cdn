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

    VERSION : '1.0.0',

    /**
     * Determines if Version2 is newer (greater) than Version1
     *
     * @source http://stackoverflow.com/questions/2809909/get-version-number-from-string-in-javascript
     * @param {string} version1
     * @param {string} [version2=Ts.VERSION]
     * @returns {boolean}
     */
    isNewer: function(version1, version2) {
        var partsA = version1.split('.');
        var partsB = (version2 ? version2 : Ts.VERSION).split('.');
        var numParts = partsA.length > partsB.length ? partsA.length : partsB.length;
        var i;

        for (i = 0; i < numParts; i++) {
            if ((parseInt(partsB[i], 10) || 0) !== (parseInt(partsA[i], 10) || 0)) {
                return ((parseInt(partsB[i], 10) || 0) > (parseInt(partsA[i], 10) || 0));
            }
        }

        return false;
    },

    /**
     *
     * @param {function|undefined} fn
     * @returns {function}
     */
    ensureFn: function(fn) {
        if (!fn) {
            return this.emptyFn;
        }

        return fn;
    },

    loadCss: function(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    },

    /**
     * Efficient reference to an empty function.
     */
    emptyFn: function() {},

    Preconditions: {

        checkVersion: function(suggestedVersion) {},

        checkExists: function(value, msg) {
            if (!value) {
                throw msg || 'The value passed in did not exist.';
            }

            return value;
        },

        /**
         * Throws an exception if the type of the input does not match the expected type.
         * Will work for undefined if you pass in undefined for the expectedType.
         * You can pass in a "!" symbol as the first letter to invert the logic.
         *
         * checkType('asdf', 'string') (returns 'asdf')
         * checkType('asdf', '!string') (throws exception)
         *
         * @param {*} value
         * @param expectedType
         * @param {String} exceptionTemplate
         * @returns {*} value
         */
        checkType: function(value, expectedType, exceptionTemplate) {
            var type = (typeof value);
            var invert = (expectedType.substring(0,1) === '!');

            if (invert) {
                expectedType = expectedType.substring(1);
            }

            if (type === expectedType) {
                if (!invert) {
                    return value;
                }
            } else {
                if (invert) {
                    return value;
                }
            }

            if (exceptionTemplate) {
                this.checkType(exceptionTemplate, 'string');

                // TODO: input template args.
                throw exceptionTemplate;
            } else {
                throw 'Incorrect type. Was ' + type + ' and expected ' + expectedType;
            }
        }
    },

    /**
     * Convenience method for ensuring the type of something.
     * Wrapper around underscorejs .result() method.
     * Gets a property from an object, but then optionally checks its type.
     *
     * @param object
     * @param propertyName
     * @param defaultValue
     * @param requiredType
     * @param exceptionTemplate
     * @returns {*}
     */
    result: function(object, propertyName, defaultValue, requiredType, exceptionTemplate) {
        return Ts.Preconditions.checkType(_.result(object, propertyName, defaultValue), requiredType, exceptionTemplate);
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

