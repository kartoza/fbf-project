define([
    'backbone', 'leaflet',
    'js/view/layers/templates/wms-layer.js',
    'js/view/layers/cql-filters/multiselect.js',
    'js/view/layers/cql-filters/single-range.js',
    'js/view/layers/layer-statistic/osm-buildings.js'], function (
    Backbone, L, WMSLayer, MultiselectFilter, SingleRangeFilter, Statistic) {
    return WMSLayer.extend({
        _layersByIntersect: 'kartoza:buildings_bbox',
        _layersByNotIntersect: 'kartoza:osm_buildings',
        filters: function () {
            let that = this;
            let databaseModel = 'osm_buildings';
            let filter = new MultiselectFilter(
                'buildings-filter',
                this._id, 'building_id', databaseModel, []);

            // this filter is for vulnerability buildings
            let vulnerabilityFilters = [
                new SingleRangeFilter(
                    'building-type-filter',
                    this._id,
                    'building_type_score',
                    databaseModel,
                    {min: 0, max: 1, from: 0, step: 0.1}
                ),
                new SingleRangeFilter(
                    'building-material-filter',
                    this._id,
                    'building_material_score',
                    databaseModel,
                    {min: 0, max: 1, from: 0, step: 0.1}
                ),
                new SingleRangeFilter(
                    'building-area-filter',
                    this._id,
                    'building_area_score',
                    databaseModel,
                    {min: 0, max: 1, from: 0, step: 0.1}
                ),
                new SingleRangeFilter(
                    'building-road-density-filter',
                    this._id,
                    'building_road_density_score',
                    databaseModel,
                    {min: 0, max: 1, from: 0, step: 0.1}
                ),
                new SingleRangeFilter(
                    'building-total-vulnerability-filter',
                    this._id,
                    'total_vulnerability',
                    databaseModel,
                    {min: 0, max: 1, from: 0, step: 0.1}
                )
            ];

            // this is for statistic
            this.statistic = new Statistic(filter, vulnerabilityFilters);
            return [filter].concat(vulnerabilityFilters);
        },
    });
});