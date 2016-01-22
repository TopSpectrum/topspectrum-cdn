define(
    ['handlebars', 'backgrid'],

    function (Handlebars, Backgrid) {

        var HeaderRow = Backgrid.HeaderRow.extend({

            makeCell: function (column, options) {
                var headerCell = column.get("headerCell") || options.headerCell || Backgrid.HeaderCell;

                headerCell = new headerCell({
                    column: column,
                    collection: this.collection
                });

                return headerCell;
            }
        });

        var HeaderCell = Backgrid.HeaderCell.extend({

            render: function() {
                this._super();

                this.$el.addClass(this.column.attributes.className);

                return this;
            }
        });

        var TemplateCell = Backgrid.Cell.extend({

            tpl: '{{ this.value }}',

            initialize: function (options) {
                this._super(options);

                this.tpl = options.column.attributes.tpl || this.tpl;

                this.$el.addClass(options.column.attributes.name);
                this.$el.addClass(options.column.attributes.className);
            },

            /**
             Render a text string in a table cell. The text is converted from the
             model's raw value for this cell's column.
             */
            render: function () {
                this.$el.empty();
                var model = this.model;

                var template = this.template();
                var args = this.templateArgs();
                this.$el.html(template(args));
                //this.delegateEvents(); // this is unneeded.
                return this;
            },

            templateArgs: function () {
                var model = this.model;

                return {
                    value: this.formatter.fromRaw(model.get(this.column.get("name")), model),
                    model: model.toJSON()
                }
            },

            template: function () {
                if (_.isString(this.tpl)) {
                    this.tpl = Handlebars.compile(this.tpl);
                }

                return this.tpl;
            }
        });


        var SingleSelectRow = Backgrid.Row.extend({

            selected: false,

            events: {
                'click' : 'click'
            },

            click: function() {
                this.selected = !this.selected;

                // Our row was clicked. We need to throw an event saying we were clicked.
                this.model.trigger('backgrid:selected', this.model, this.selected);
            },

            initialize: function(options) {
                this._super(options);

                if (this.model && this.model.collection) {
                    this.listenTo(this.model.collection, 'backgrid:selected', function(model, selected) {
                        var their_id = (model) ? (model.id || model.cid) : null;
                        var my_id = this.model.id || this.model.cid;
                        var is_us = (their_id === my_id);

                        if (!is_us) {
                            // It is not us. We are 'single select' so we need to unselect ourselves and refresh our UI.
                            if (!this.selected) {
                                return;
                            } else {
                                // Turn ourselves off...
                                this.selected = false;
                            }
                        } else {
                            // It's us!
                        }

                        this.refreshSelectedIndicator();
                    });
                }

            },

            refreshSelectedIndicator: function() {
                if (this.selected) {
                    this.$el.addClass('selected');
                } else {
                    this.$el.removeClass('selected');
                }
            },

            /**
             Factory method for making a cell. Used by #initialize internally. Override
             this to provide an appropriate cell instance for a custom Row subclass.

             @protected
             @param {Backgrid.Column} column
             @param {Object} options The options passed to #initialize.
             @override
             @return {Backgrid.Cell}
             */
            makeCell: function (column) {
                var cell = column.get("cell") || Backgrid.Cell;

                return new cell({
                    column: column,
                    model: this.model
                });
            },

            render: function() {
                this.refreshSelectedIndicator();

                return this._super();
            }
        });

        function upgrade(Class) {
            return Class.extend({
                initialize: function(options) {
                    this._super(options);

                    this.$el.addClass(this.column.attributes.className);
                }
            });
        }

        var DateCell = upgrade(Backgrid.DateCell);
        var StringCell = upgrade(Backgrid.StringCell);
        var NumberCell = upgrade(Backgrid.NumberCell);

        var Grid = Backgrid.Grid.extend({
            initialize: function(options) {
                if (options) {
                    if (!options.row) {
                        options.row = Backgrid.Row;
                    }
                }

                this._super(options);
            }
        });

        Backgrid.Row = SingleSelectRow;
        Backgrid.Grid = Grid;
        Backgrid.HeaderCell = HeaderCell;
        Backgrid.HeaderRow = HeaderRow;

        Backgrid.Cell = TemplateCell;
        Backgrid.DateCell = DateCell;
        Backgrid.StringCell = StringCell;
        Backgrid.NumberCell = NumberCell;

        //Backgrid.resolveNameToClass = function (name, suffix) {
        //    if (_.isString(name)) {
        //        var key = _.map(name.split('-'), function (e) {
        //                return e.slice(0, 1).toUpperCase() + e.slice(1);
        //            }).join('') + suffix;
        //        var klass = Backgrid[key] || Backgrid.Extension[key];
        //        if (_.isUndefined(klass)) {
        //            throw new ReferenceError("Class '" + key + "' not found");
        //        }
        //        return klass;
        //    }
        //
        //    return name;
        //};

        return Backgrid;
    });