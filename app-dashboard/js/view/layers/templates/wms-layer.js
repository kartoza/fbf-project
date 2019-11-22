define([
    'backbone', 'leaflet'], function (Backbone, L) {
    return Backbone.View.extend({
        _id: 0,
        _url: geoserverUrl,
        _layers: '',
        _layersByIntersect: '',
        _layersByNotIntersect: '',
        initialize: function (mapView) {
            this.mapView = mapView;
            this.map = mapView.map;
            this.addLayer();
            this.listenTo(dispatcher, 'layer-' + this._id + ':refresh', this.addLayer);
            this._filters = this.filters();
        },
        filters: function () {
            /** This will init the filters for this layer
             * This needs to returns in array filters **/
            return [];
        },
        addLayer: function () {
            /** Init and add layer
             * - Layer removed
             * - Layer initiated with parameters
             * - Add layer to map **/
                // get the cql filter
            let cqlFilters = this.cqlFilters();
            let parameters = {
                layers: this._layers,
                format: 'image/png',
                transparent: true,
                tiled: true,
            };
            if (cqlFilters) {
                parameters['cql_filter'] = cqlFilters
            }
            if (!this.layer) {
                // add the layer
                this.layer = L.tileLayer.wms(
                    this._url, parameters);
                this.group = L.layerGroup([this.layer])
                this.map.addLayer(this.group);
                this._id = this.layer._leaflet_id;
            } else {
                delete (this.layer.wmsParams.cql_filter);
                this.layer.setParams(parameters);
            }
        },
        cqlFilters: function () {
            /** Get cqlFilters by the filters **/
            let filters = [];

            let mapCqlFilter = this.mapView.cqlFilter();
            this._layers = this._layersByNotIntersect;
            if (mapCqlFilter) {
                filters.push(mapCqlFilter);
                this._layers = this._layersByIntersect;
            }
            $.each(this._filters, (index, filter) => {
                let layerCqlFilter = filter.cqlFilter();
                if (layerCqlFilter) {
                    filters.push(layerCqlFilter)
                }
            });
            if (filters.length === 0) {
                return null
            } else {
                return filters.join(' AND ')
            }
        }
    });
});