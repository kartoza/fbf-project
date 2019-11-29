define([
    'backbone', 'leaflet',
    'js/view/layers/templates/wms-layer.js',
    'js/view/layers/cql-filters/multiselect.js',
    'js/view/layers/layer-statistic/osm-roads.js'], function (
    Backbone, L, WMSLayer, MultiselectFilter, Statistic) {
    return WMSLayer.extend({
        _layersByIntersect: 'kartoza:roads_bbox',
        _layersByNotIntersect: 'kartoza:osm_roads',
        filters: function () {
            let that = this;
            let filter = new MultiselectFilter(
                'roads-filter',
                this._id, 'roads_id', 'osm_roads', []);

            // call filters from api
            AppRequest.get(
                postgresUrl + 'osm_roads_mv', [], null,
                function (data) {
                    $.each(data, (index, row) => {
                        row['type'] = row['road_type'];
                        row['type_id'] = row['road_id'];
                    });
                    filter.options = data;
                    filter.render();
                    that.addLayer();
                },
                function (data) {
                    console.log(data)
                });
            this.statistic = new Statistic(filter);
            return [filter]
        },
    });
});