
/**
 * For managing micro history states.
 *
 * @type {Ts.Object}
 */
Ts.Historylet = (new Ts.Object({

    watches: {},

    current: null,

    history: null,

    onPopState : function() {
        if (!Modernizr.history || !this.history) {
            return;
        }

        var controller;

        if (this.current) {
            controller = this.popCurrentController();

            if (controller && !controller.cancelled) {
                controller.trigger('deactivate');
            }
        }

        var state = this.history.state;

        if (state) {
            state = state.number;
        }

        controller = this.watches[state];

        if (controller && !controller.cancelled) {
            controller.trigger('activate');
            this.current = controller.num;
        }
    },

    bind: function(history) {
        this.history = history;

        return this.history;
    },

    getCurrentController : function() {
        return this.watches[this.current];
    },

    popCurrentController: function() {
        var controller = this.watches[this.current];
        delete this.watches[this.current];
        delete this.current;
        return controller;
    },

    /**
     * Register a fleeting
     *
     * @param callback
     * @return controller object
     */
    push: function() {

        var num = Math.random();
        var that = this;

        var result = new Ts.Object({

            cancelled: false,

            num: num,

            initialize: function() {

            },

            cancel: function() {
                if (this.cancelled) {
                    return;
                } else if (this !== that.getCurrentController()) {
                    throw 'Only can cancel current one with this implementation';
                }

                this.cancelled = true;
                this.trigger('cancelled');
            }
        });

        this.watches[num] = result;

        if (this.history) {
            var controller = this.getCurrentController();

            if (controller && controller.cancelled) {
                this.history.replaceState({number: num}, window.title, window.url);
            } else {
                this.history.pushState({number: num}, window.title, window.url);
            }

            result.pushed = true;
        } else {
            result.pushed = false;
        }

        this.current = num;

        return result;
    }

}));

Ts.Historylet.bind(window.history);
$(window).on('popstate', $.proxy(Ts.Historylet.onPopState, Ts.Historylet));