define([
    'backbone', 'leaflet'], function (Backbone, L) {
    return Backbone.View.extend({
        basemaps: {
            "Kartoza": L.tileLayer.wms(
                gwcURL, {
                    layers: 'kartoza:web',
                    format: 'image/png',
                    transparent: true,
                    TILED: true,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }),
                "Carto Positron": L.tileLayer('http://s.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                opacity: 1.0,
                attribution: 'Data from <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors;' +
                    ' tiles &copy; <a href="http://carto.com/attributions">Carto</a>, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                }),
                "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    opacity: 1.0,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }),
                "Stamen Terrain Background": L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
                    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    subdomains: 'abcd',
                    minZoom: 0,
                    maxZoom: 16,
                    ext: 'png'
                }),
                "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                    opacity: 1.0,
                    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                        '<a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>' +
                        ' (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                    maxZoom: 17,
                })
        },
        initialize: function (mapView) {
            this.basemaps[Object.keys(this.basemaps)[0]].addTo(mapView.map);

        },
    });
});