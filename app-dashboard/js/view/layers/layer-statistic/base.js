define([
    'backbone', 'leaflet'], function (
    Backbone, L) {
    return Backbone.View.extend({
        xhrByType: {},
        xhrPolygon: {},
        polygonName: null,
        initialize: function (multiselectFilter) {
            /**
             * multiselect view of backbone
             * Take filters value as the query for update the status
             * **/
            this.listenTo(dispatcher, multiselectFilter.databaseModel + ':update-stats', this.updateStats);
            this.multiselectFilter = multiselectFilter;
        },
        loading: function () {
            this.multiselectFilter.$el.find('span').each(function (index) {
                $(this).html('<i class="loading">loading</i>');
            });
        }
    });
});