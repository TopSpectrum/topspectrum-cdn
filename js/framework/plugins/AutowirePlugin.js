define(['jquery', 'underscore', 'Ts'], function ($, _, Ts) {

    /**
     * @class AutowirePlugin
     */
    return Ts.Plugin.extend({

        start: function () {
            this._super();

            this.listenTo(this.parent, 'dom-changed', this.search);
            this.search();
        },

        search: function () {
            /* @type Application */
            var parent = this.parent;

            /**
             *
             * @param {String} name The name of package to require.
             * @returns {Function}
             */
            function defaults(name) {

                return function() {
                    var $el = $(this);
                    var autowire = $el.attr('data-autowire');

                    if (!autowire) {
                        $el.attr('data-autowire', name);
                    }
                }
            }

            // The default value is "feature"
            $('[data-feature][data-autowire!="false"]:not([data-autowired])').each(defaults('feature'));
            $('[data-widget][data-autowire!="false"]:not([data-autowired])').each(defaults('widget'));
            $('[data-plugin][data-autowire!="false"]:not([data-autowired])').each(defaults('app/Plugin'));

            function autowire(nodeName, path) {
                var selector = nodeName + '[xtype]:not([data-autowire]):not([data-autowired])';

                $(selector).each(function() {
                    var $el = $(this);
                    var xtype = $el.attr('xtype');

                    // Does it contain slashes already?
                    if (_.isString(xtype)) {
                        if (-1 == xtype.indexOf('/')) {
                            xtype = path + xtype;
                        }
                    }

                    $el.attr('data-autowire', xtype);
                });
            }

            autowire('widget', 'app/widgets/');
            autowire('feature', 'app/features/');
            autowire('view', 'app/views/');
            autowire('action', 'app/actions/');

            var scope = this;

            var $els = $('[data-autowire][data-autowire!="false"]').each(function () {
                var $el = $(this);

                // Don't load the same feature twice. Does it exist?
                var existingFeature = $el.data('tls.autowire.instance');
                if (existingFeature) {
                    return;
                }

                var selector = $el.attr('data-autowire');

                if (!selector || 'false' === selector) {
                    // Skip it.
                    return;
                }

                // It might be a selector, or it might be a package name.
                var spec = $el.attr('data-' + selector);

                if (!spec) {
                    // It wasn't a selector after all...
                    spec = selector;
                }

                if (_.isString(spec)) {
                    spec = { xtype: spec };
                }

                spec.$el = $el;

                $el.removeAttr('data-autowire');
                $el.attr('data-autowired', selector);

                // { xtype: 'app/asdf/asdf/Widget', target: $el }

                scope.log('adding', spec);
                parent.addPlugin(spec)
                    .done(function (plugin) {
                        $el.data('tls.autowire.instance', plugin);
                    });
            });

        }
    });
});
