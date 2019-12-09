define([
    'backbone',
    'jquery',
    'js/view/basemap.js',
    'js/view/layers.js',
    'js/view/side-panel.js',
    'js/view/intro.js',
    'js/model/depth_class.js'
], function (Backbone, $, Basemap, Layers, SidePanelView, IntroView, DepthClassCollection) {
    return Backbone.View.extend({
        initBounds: [[-21.961179941367273,93.86358289827513],[16.948660219367564,142.12675002072507]],
        initialize: function () {
            // constructor
            this.map = L.map('map').setView([51.505, -0.09], 13).fitBounds(this.initBounds);
            this.basemap = new Basemap(this);
            this.layers = new Layers(this);
            this.layer_control = L.control.layers(
                this.basemap.basemaps,
                this.layers.groups, {position: 'topleft'});
            this.layer_control.addTo(this.map);
            this.depth_class_collection = new DepthClassCollection();
            this.depth_class_collection.fetch();
            this.initDraw();
            this.listenTo(dispatcher, 'map:redraw', this.redraw);
            this.listenTo(dispatcher, 'map:draw-geojson', this.drawGeojsonLayer);
            this.listenTo(dispatcher, 'map:remove-geojson', this.removeGeojsonLayer);

            // dispatcher registration
            dispatcher.on('map:draw-forecast-layer', this.drawForecastLayer, this);
            dispatcher.on('map:remove-forecast-layer', this.removeForecastLayer, this);
            dispatcher.on('map:show-map', this.showMap, this);
            dispatcher.on('map:hide-map', this.hideMap, this);
            dispatcher.on('map:fit-bounds', this.fitBounds, this);
            dispatcher.on('map:show-region-boundary', this.showRegionBoundary, this);
            dispatcher.on('map:fit-forecast-layer-bounds', this.fitForecastLayerBounds, this);
        },
        addOverlayLayer: function(layer, name){
            this.layer_control.addOverlay(layer, name);
            layer.addTo(this.map);
        },
        removeOverlayLayer: function(layer){
            this.layer_control.removeLayer(layer);
            this.map.removeLayer(layer);
        },
        removeForecastLayer: function(){
            if(this.forecast_layer){
                this.removeOverlayLayer(this.forecast_layer)
                this.forecast_layer = null;
            }
            dispatcher.trigger('map:redraw');
            this.map.fitBounds(this.initBounds);
            this.map.setZoom(5);
            dispatcher.trigger('dashboard:reset')
        },
        showMap: function() {
            $(this.map._container).show();
            this.map._onResize();
            this.map.setZoom(5);
        },
        hideMap: function () {
            $(this.map._container).hide();
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
                    that.addOverlayLayer(forecast_layer, 'Flood Forecast');
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
        fitForecastLayerBounds: function (forecast, callback) {
            let that = this;
            forecast.fetchExtent()
                .then(function (extent) {
                    that.map.fitBounds(extent.leaflet_bounds);
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
            this.map.setZoom(5);
            dispatcher.trigger('dashboard:reset')
        },
        fitBounds: function (bounds) {
            this.map.fitBounds(bounds)
        },
        showRegionBoundary: function (region, region_id) {
            if(this.region_layer){
                this.removeOverlayLayer(this.region_layer);
                this.region_layer = null;
            }
            dispatcher.trigger('map:redraw');
            this.region_layer = L.tileLayer.wms(
                geoserverUrl,
                {
                    layers: `kartoza:${region}_boundary`,
                    format: 'image/png',
                    transparent: true,
                    srs: 'EPSG:4326',
                    cql_filter: `id_code=${region_id}`,
                });
            this.region_layer.setZIndex(20);
            this.addOverlayLayer(this.region_layer, 'Administrative Boundary');
            // TODO: Enable this line to show exposed buildings when the layer is available
            // TODO: issue: https://github.com/kartoza/fbf-project/issues/123
            // this.showExposedBuildings(region, region_id);
        },
        showExposedBuildings: function (region, region_id) {
            const that = this;
            if(this.exposed_layers){
                this.exposed_layers.forEach(l => that.removeOverlayLayer(l.layer));
                this.exposed_layers = null;
            }
            dispatcher.trigger('map:redraw');

            let id_key = {
                'district': 'dc_code',
                'sub_district': 'sub_district_id',
                'village': 'village_id',
            }

            this.exposed_layers = this.depth_class_collection.map(function (depth_class) {
                let label = `Exposed Buildings in Depth Class: ${depth_class.get('label')}`
                let exposed_layer = L.tileLayer.wms(
                    geoserverUrl,
                    {
                        layers: `kartoza:exposed_buildings`,
                        format: 'image/png',
                        transparent: true,
                        srs: 'EPSG:4326',
                        cql_filter: `${id_key[region]}=${region_id} AND depth_class=${depth_class.id}`,
                    }
                );
                exposed_layer.setZIndex(10 + depth_class.id);
                return {
                    layer: exposed_layer,
                    name: label
                }
            });
            this.exposed_layers.forEach(l => that.addOverlayLayer(l.layer, l.name));
        }
    });
});
