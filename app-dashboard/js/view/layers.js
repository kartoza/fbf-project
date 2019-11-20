define([
    'backbone', 'leaflet',
    'js/view/layers/osm-buildings.js',
    'js/view/layers/osm-rivers.js',
    'js/view/layers/osm-roads.js',
    'js/view/layers/layer-statistic/osm-polygon-statistic.js'], function (
    Backbone, L,
    OSMBuildings, OSMRivers, OSMRoads, PolygonStatistic) {
    return Backbone.View.extend({
        initialize: function (mapView) {
            let buildings = new OSMBuildings(mapView);
            let rivers = new OSMRivers(mapView);
            let roads = new OSMRoads(mapView);
            this.layers = [buildings, rivers, roads];
            this.groups = {
                'Buildings': buildings.group,
                'Rivers': rivers.group,
                'Roads': roads.group,
            }
            this.polygonStatistic = new PolygonStatistic([buildings.statistic, rivers.statistic, roads.statistic]);
        },
    });
});