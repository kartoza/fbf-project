define([
    'backbone', 'leaflet',
    'js/view/layers/layer-statistic/base.js'], function (
    Backbone, L, Base) {
    return Base.extend({
        xhr: null,
        prefixView: 'flooded_buildings_',
        initialize: function (multiselectFilter, filters) {
            /**
             * multiselect view of backbone
             * Take filters value as the query for update the status
             * **/
            this.multiselectFilter = multiselectFilter;
            this.filters = filters;
        }
    });
});