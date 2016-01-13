define(['require', 'jquery', 'underscore', 'Ts'], function (require, $, _, Ts) {

    /**
     * @class Model
     * @alias app.Modal
     * @extends View
     */
    var Modal = Ts.View.extend({

        /**
         * @private
         */
        tagName: 'modal',

        /**
         * @public
         * @type String
         */
        xtype: 'Modal',

        /**
         * @cfg {Backbone.Model} The model for this class.
         * @public
         */
        model: null,

        /**
         * @public
         * @cfg {Boolean}
         * @type Boolean
         */
        removeOnHide: false,

        /**
         * @public
         * @cfg {Boolean}
         * @type Boolean
         */
        backdrop: true,

        /**
         * @public
         * @cfg {Boolean}
         * @type Boolean
         */
        keyboard: true,

        /**
         * @private
         * @type $.Deferred
         */
        _hide_deferred: undefined,

        $modal: null,

        events: {
            'click [data-modal-action="close"]': 'remove',
            'click [data-modal-action="hide"]': 'hide',

            'shown.bs.modal': 'onModalShown',
            'hidden.bs.modal': 'onModalHidden'
        },

        /**
         * @protected
         */
        initEl: function () {
            this._super();

            this.$modal = this.$('.modal');
            this.$modal.modal({
                keyboard: this.keyboard,
                backdrop: this.backdrop,
                show: false
            });
        },

        /**
         * Async call
         *
         * @returns {*}
         */
        hide: function () {
            // If we were "in the process
            if (this._hide_deferred) {
                return this._hide_deferred.promise();
            }

            var deferred = this._hide_deferred = $.Deferred();

            {
                if (this.isShown()) {
                    this.$modal.modal('hide');
                } else {
                    if (this._hide_deferred) {
                        // already hidden.
                        this._hide_deferred.reject();
                        delete this._hide_deferred;
                    }
                }

                var promise = deferred.promise();
                var scope = this;

                // Auto clean up our reference.
                promise.always(function () {
                    delete scope._hide_deferred;
                });
            }

            return promise;
        },

        remove: function () {
            if (this.isShown()) {
                this.hide()
                    .done(function () {
                        this.remove();
                    });
            } else {
                this._super();
            }
        },

        isShown: function () {
            if (!this.isAttached()) {
                return false;
            } else if (!this.rendered) {
                return false;
            } else if (!this.$modal) {
                return false;
            }

            return this.$modal.hasClass('in');
        },

        ensureAttached: function () {
            if (!this.isAttached()) {
                return this.attachEl();
            }

            return this.$el;
        },

        /**
         * This is an unsafe call. You should call ensureAttached() instead.
         *
         * This method will call render for you if it has not been called already.
         *
         * @returns {$el}
         */
        attachEl: function () {
            $(document.body).append(this.getRenderedEl());

            return this.$el;
        },

        show: function () {
            this.beforeShow();
            this._show();
            this.afterShow();
        },

        beforeShow: function() {
            this.trigger('beforeShow');
        },

        _show: function() {
            this.ensureAttached();

            if (this.isShown()) {
                return;
            }

            this.$modal.modal({
                backdrop: this.backdrop,
                keyboard: this.keyboard,
                show: true
            });
        },

        afterShow: function() {
            this.trigger('afterShow');
        },

        onModalHidden: function () {
            if (this._hide_deferred) {
                this._hide_deferred.resolveWith(this);
                delete this._hide_deferred;
            }

            this.trigger('hidden');

            if (this.removeOnHide) {
                this.remove();
            }
        },

        onModalShown: function () {
            this.trigger('shown');
        }

    });

    return Modal;
});