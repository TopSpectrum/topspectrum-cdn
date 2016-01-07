define(['backbone'], function(Backbone) {

    /**
     * This class is spring-paging-compatible and strictly Backbone.Collection compatible.
     *
     * @class Collection
     * @alias app.Collection
     * @alias PageableCollectio
     * @extends Backbone.PageableCollection
     */
    return Backbone.PageableCollection.extend({

        state: {
            firstPage: 0,
            pageSize: 1000
        },

        parseRecords: function(resp, options) {
            return resp.content;
        },

        parseState: function(resp, options) {
            return resp;
        },

        queryParams: {
            currentPage: 'number',
            pageSize: 'size',
            totalPages: 'totalPages',
            totalRecords: 'totalElements',
            sortKey: 'sortBy',
            order: 'order'
        }
    });
});