define([
    'backbone', 'underscore'], function (Backbone, _) {
    return Backbone.View.extend({
        id: null,
        templateID: null,
        databaseModel: null,
        initialize: function (elementID, layerID, filterName, databaseModel, options) {
            this.elementID = elementID;
            this.layerID = layerID;
            this.filterName = filterName;
            this.options = options;
            this.databaseModel = databaseModel;
            this.render();
        },
        render: function () {
            /** Render filters into dom **/
            this.$el = $('#' + this.elementID);
            let template = _.template($('#' + this.templateID).html());
            this.$el.html(template({
                'id': this.id,
                'options': this.options
            }));
            this.initEvent();
        },
        initEvent: function () {
            /** Initiate all event listener **/
        },
        cqlFilter: function () {
            /** Get cql filters that selected **/
            return null;
        }
    });
});