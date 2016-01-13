define(['require', 'jquery', 'underscore', 'Ts'], function (require, $, _, Ts) {

    /**
     * @class Model
     * @alias app.Modal
     */
    var Modal = Ts.View.extend({

        /**
         * @cfg {Backbone.Model} The model for this class.
         */
        model: null,

        tagName: 'modal',

        $modal: null,

        removeOnHide: false,
        allowHideOnClick: true,

        events: {
            'click [data-action="close"]': 'onHideClick',
            'shown.bs.modal': 'onModalShown',
            'hidden.bs.modal': 'onModalHidden'
        },

        _hide_promise: undefined,

        //templateArgs: function() {
        //    return (this.model && this.model.toJSON) ? this.model.toJSON() : this.model;
        //},
        //
        //applyTemplate: function() {
        //    return this.template(_.isFunction(this.templateArgs) ? this.templateArgs() : this.templateArgs);
        //},

        afterRender: function () {
            this.initModalEl();

            Ts.View.prototype.afterRender.apply(this, arguments);
        },

        initModalEl: function () {
            this.$modal = this.$el.find('.modal');
            this.$modal.modal();
        },

        onHideClick: function () {
            if (this.allowHideOnClick) {
                this.hide();
            }
        },

        /**
         * Alias for remove.
         */
        hide: function () {
            this.beforeHide();
            this._hide();
            this.afterHide();
        },

        _hide: function() {
            if (this.isShown()) {
                this.$modal.modal('hide');
            }
        },

        beforeHide: function() {
            this.trigger('beforeHide');
            return this;
        },

        /**
         * This is NOT called after the Modal animates away. It is called immediately after the Hide method is called.
         * If you want to listen for "after the modal finishes animating away" you should override
         * onModalHidden or onModelShown.
         */
        afterHide: function() {
            this.trigger('afterHide');
        },

        remove: function () {
            if (this.isShown()) {
                this.removeOnHide = true;
                this.hide();
            } else if (this.isAttached()) {
                Ts.View.prototype.remove.apply(this, arguments);
            } else {
                // Looks like we are already removed... Nothing to do here. Move along.
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

            this.$modal.modal('show');
        },

        afterShow: function() {
            this.trigger('afterShow');
        },

        onModalHidden: function () {
            this.trigger('hidden');
            debugger;
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