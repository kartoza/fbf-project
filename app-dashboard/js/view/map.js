define([
    'backbone',
    'jquery',
    'js/view/basemap.js',
    'js/view/layers.js',
    'js/view/side-panel.js',
    'js/view/intro.js',
], function (Backbone, $, Basemap, Layers, SidePanelView, IntroView) {
    return Backbone.View.extend({
        initBounds: [[-21.961179941367273,93.86358289827513],[16.948660219367564,142.12675002072507]],
        initialize: function () {
            // constructor
            this.map = L.map('map').setView([51.505, -0.09], 13).fitBounds(this.initBounds);
            this.basemap = new Basemap(this);
            this.layers = new Layers(this);
            L.control.layers(
                this.basemap.basemaps,
                this.layers.groups, {position: 'topleft'}).addTo(this.map);
            this.initDraw();
            this.listenTo(dispatcher, 'map:redraw', this.redraw);
            this.listenTo(dispatcher, 'map:draw-geojson', this.drawGeojsonLayer);
            this.listenTo(dispatcher, 'map:remove-geojson', this.removeGeojsonLayer);

            // dispatcher registration
            dispatcher.on('map:draw-forecast-layer', this.drawForecastLayer, this);
            dispatcher.on('map:remove-forecast-layer', this.removeForecastLayer, this);
            dispatcher.on('map:show-map', this.showMap, this);
        },
        removeForecastLayer: function(){
            if(this.forecast_layer){
                this.map.removeLayer(this.forecast_layer)
                this.forecast_layer = null;
            }
            dispatcher.trigger('map:redraw');
            this.map.fitBounds(this.initBounds);
            dispatcher.trigger('dashboard:reset')
        },
        showMap: function() {
            $(this.map._container).show();
            this.map._onResize();
            this.map.setZoom(5);
        },
        drawForecastLayer: function(forecast, callback){
            const that = this;
            // get zoom bbox
            forecast.fetchExtent()
                .then(function (extent) {
                    // create WMS layer
                    let forecast_layer = forecast.leafletLayer();
                    // add layer to leaflet
                    if(that.forecast_layer){
                        that.map.removeLayer(that.forecast_layer);
                    }
                    dispatcher.trigger('map:redraw');
                    forecast_layer.addTo(that.map);
                    // zoom to bbox
                    that.map.fitBounds(extent.leaflet_bounds);
                    // register layer to view
                    that.forecast_layer = forecast_layer;
                    dispatcher.trigger('side-panel:open-dashboard');
                    if(callback) {
                        callback();
                    }
                })

        },
        redraw: function () {
            $.each(this.layers.layers, function (index, layer) {
                layer.addLayer();
            });
        },
        initDraw: function () {
            /** initiate leaflet draw **/
            let that = this;
            this.drawGroup = new L.FeatureGroup();
            this.drawControl = new L.Control.Draw({
                draw: {
                    polygon: true,
                    polyline: false,
                    circlemarker: false,
                    marker: false,
                    circle: false,
                    rectangle: false
                },
                edit: {
                    featureGroup: this.drawGroup,
                    edit: false
                }
            });
            
            $('#draw-flood').click(function () {
                if ($(this).hasClass('enable')) {
                    that.map.removeControl(that.drawControl);
                    $(this).removeClass('enable');
                } else {
                    that.map.addControl(that.drawControl);
                    $(this).addClass('enable');
                }
            });
            
            this.map.addLayer(this.drawGroup);

            this.map.on('draw:created', (e) => {
                that.drawGroup.clearLayers();
                that.drawGroup.addLayer(e.layer);
                let $drawFormWrapper = $('#draw-flood-form').parent();
                let $drawFormParent = $drawFormWrapper.parent();
                $drawFormParent.prev().hide();
                $drawFormWrapper.show();
                $drawFormParent.show("slide", { direction: "right" }, 400);

                $('#cancel-draw').click(function () {
                    that.drawGroup.removeLayer(e.layer);
                    $('#draw-flood').removeClass('enable');
                    that.map.removeControl(that.drawControl);
                });

                $("#draw-form").submit(function(e){
                    e.preventDefault();
                    dispatcher.trigger('map:update-polygon', that.postgrestFilter());
                    $('#draw-flood').removeClass('enable');
                    that.map.removeControl(that.drawControl);
                    $drawFormWrapper.hide();
                    $drawFormParent.hide("slide", { direction: "right" }, 200);
                    $drawFormParent.prev().show("slide", { direction: "right" }, 400);
                });
            });

            this.map.on('draw:deleted', (evt) => {
                dispatcher.trigger('map:update-polygon', that.postgrestFilter());
                that.redraw();
            });

            this.side_panel = new SidePanelView();
            this.intro_view = new IntroView();
        },
        polygonDrawn: function () {
            if (this.drawGroup && this.drawGroup.getLayers().length > 0) {
                let locations = [];
                $.each(this.drawGroup.getLayers()[0].getLatLngs()[0], (index, latLng) => {
                    locations.push(latLng.lng + ' ' + latLng.lat)
                });

                // add first point to make it closed
                let firstPoint = this.drawGroup.getLayers()[0].getLatLngs()[0];
                locations.push(firstPoint[0].lng + ' ' + firstPoint[0].lat)
                return locations
            } else {
                return null;
            }
        },
        cqlFilter: function () {
            /** get cql from drawn polygon **/
            if (!this.layers) {
                return null;
            }
            let flood_id = null;
            try {
                flood_id = floodCollectionView.displayed_flood.id;
            }catch (err){

            }

            if (flood_id !== null) {
                return "flood_id=" + flood_id;
            } else {
                return null
            }
        },
        postgrestFilter: function () {
            /** get postgrest from drawn polygon **/
            let locations = this.polygonDrawn();
            if (locations) {
                return 'SRID=4326;MULTIPOLYGON(((' + locations.join(',') + ')))';
            } else {
                return null
            }
        },
        drawGeojsonLayer: function (polygon) {
            let that = this;
            if(that.geojson_layer){
                that.map.removeLayer(that.geojson_layer)
            }
            this.redraw();
            that.geojson_layer = new L.GeoJSON(polygon).addTo(that.map);
            that.map.fitBounds(that.geojson_layer.getBounds());
            dispatcher.trigger('side-panel:open-dashboard');
        },
        removeGeojsonLayer: function () {
            let that = this;
            if(that.geojson_layer){
                that.map.removeLayer(that.geojson_layer)
            }
            this.redraw();
            that.map.fitBounds(this.initBounds);
            dispatcher.trigger('dashboard:reset')
        }
    });
});
