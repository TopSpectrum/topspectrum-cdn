define(['require', 'jquery', 'underscore', 'Ts', 'bluebird'], function (require, $, _, Ts) {

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

        shouldPreventHide: false,

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
         * @type {Promise|{__reject:function,__resolve:function}}
         */
        __hide_promise: undefined,

        $modal: null,

        events: {
            'click [data-modal-action="close"]': 'remove',
            'click [data-modal-action="hide"]': 'hide',

            'shown.bs.modal': 'onModalShown',
            'hidden.bs.modal': 'onModalHidden',
            'hide.bs.modal.prevent': 'onShouldPreventHide'
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

        onShouldPreventHide: function(e) {
            if (this.shouldPreventHide) {
                e.preventDefault();
            }
        },

        /**
         * Async call
         *
         * @returns {Promise}
         */
        hide: function () {
            // are we already hidden?
            if (!this.isShown()) {
                return Promise.resolve(this);
            }

            // Are we still waiting?
            if (this.__hide_promise) {
                return this.__hide_promise;
            }

            /** @type {Modal|{__hide_promise:Promise}} */
            var scope = this;

            // If we were "in the process
            var __resolve;
            var __reject;
            /**
             * @type {Promise}
             */
            var promise = scope.__hide_promise = new Promise(function(resolve, reject) {
                __resolve = resolve;
                __reject = reject;
            });

            scope.__hide_promise.__reject = __reject;
            scope.__hide_promise.__resolve = __resolve;

            // Auto clean up our reference.
            promise.finally(function() {
                delete scope.__hide_promise;
            });

            // The promise will be completed in the onModalHidden callback.
            scope.$modal.modal('hide');

            return promise;
        },

        remove: function () {
            if (this.isShown()) {
                var scope = this;

                this.hide()
                    .then(function () {
                        scope.remove();
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

        //region show
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
        //endregion

        onModalHidden: function () {
            if (this.__hide_promise) {
                this.__hide_promise.__resolve(this);
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