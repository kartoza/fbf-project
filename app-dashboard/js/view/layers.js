define([
    'backbone', 'leaflet',
    'js/view/layers/osm-buildings.js'], function (
    Backbone, L, OSMBuildings) {
    return Backbone.View.extend({
        initialize: function (mapView) {
            let buildings = new OSMBuildings(mapView);
            this.layers = [buildings];
            this.groups = {
                'Buildings': buildings.group,
            }
        },
    });
});