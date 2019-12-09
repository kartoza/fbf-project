define([
    'backbone', 'leaflet',
    'js/view/layers/osm-buildings.js',
    'js/view/layers/layer-statistic/osm-polygon-statistic.js'], function (
    Backbone, L, OSMBuildings, PolygonStatistic) {
    return Backbone.View.extend({
        initialize: function (mapView) {
            let buildings = new OSMBuildings(mapView);
            this.layers = [buildings];
            this.groups = {
                'Buildings': buildings.group,
            }
            this.polygonStatistic = new PolygonStatistic([buildings.statistic]);
        },
    });
});