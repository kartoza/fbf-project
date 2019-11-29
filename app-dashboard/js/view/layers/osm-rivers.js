define([
    'backbone', 'leaflet',
    'js/view/layers/templates/wms-layer.js',
    'js/view/layers/cql-filters/multiselect.js',
    'js/view/layers/layer-statistic/osm-rivers.js'], function (
    Backbone, L, WMSLayer, MultiselectFilter, Statistic) {
    return WMSLayer.extend({
        _layersByIntersect: 'kartoza:waterways_bbox',
        _layersByNotIntersect: 'kartoza:osm_waterways',
        filters: function () {
            let that = this;
            let filter = new MultiselectFilter(
                'waterways-filter',
                this._id, 'waterway_id', 'osm_waterways', []);

            // call filters from api
            AppRequest.get(
                postgresUrl + 'osm_waterways_mv', [], null,
                function (data) {
                    $.each(data, (index, row) => {
                        row['type'] = row['waterway'];
                        row['type_id'] = row['waterway_id'];
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