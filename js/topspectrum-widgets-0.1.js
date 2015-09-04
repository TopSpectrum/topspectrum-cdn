/**
 * @class Ts.View
 * @extends Backbone.View
 */
Ts.View = Backbone.View.extend({

    $el : null,

    initialize: function (args) {
        $.extend(this, args);

        this.onInit(args);
    },

    onInit : Ts.emptyFn

});

/**
 * @class Ts.Modal
 * @extends Ts.View
 */
Ts.Modal = Ts.View.extend({

    isShown: function() {
        return this.$el.hasClass('in');
    },

    show: function () {
        this.$el.modal('show');
        return this;
    },

    hide: function () {
        this.$el.modal('hide');
        return this;
    }
});