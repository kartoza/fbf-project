define([
    'backbone', 'leaflet'], function (Backbone, L) {
    return Backbone.View.extend({
        basemaps: {
            "Kartoza": L.tileLayer.wms(
                geoserverUrl, {
                    layers: 'kartoza:web',
                    format: 'image/png',
                    transparent: true,
                    TILED: true,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                })
        },
        initialize: function (mapView) {
            this.basemaps[Object.keys(this.basemaps)[0]].addTo(mapView.map);
        },
    });
});