define([
    'backbone',
    'leaflet',
    'jquery',
    'wellknown',
    'js/model/flood.js',
    'js/model/forecast_event.js'],
    function (Backbone, L, $, Wellknown, FloodModel, ForecastEvent) {
    return Backbone.View.extend({
        el: '#draw-flood-form',
        post_data: {},
        initialize: function (polygon) {
            this.create_data(polygon)
            this.$form = this.$el;
            this.$place_name = $form.find("input[name='place_name']");
            this.$event_notes = $form.find("input[name='event_notes']");
            this.$return_period = $form.find("input[name='return_period']");
            this.$depth_class = $form.find("input[name='depth_class']");
            this.$acquisition_date = $form.find("input[name='acquisition_date']");
            this.$forecast_date = $form.find("input[name='forecast_date']");
        },
        create_data: function (polygon) {
            const that = this;

            // make flood model map
            const place_name = this.$place_name.val();
            const source = 'User';
            const event_notes = this.$event_notes.val();
            const flood_model_notes = 'User defined polygon';
            const source_url = '-';
            const return_period = this.$return_period.val();
            // parse from WKT to geojson
            const depth_class = this.$depth_class.val();
            const acquisition_date = new Date(this.$acquisition_date.val()).toMysqlFormat();
            const forecast_date = new Date(this.$forecast_date.val()).toMysqlFormat();

            // assign depth class to geojson
            const feature = Wellknown.parse(polygon);
            feature.properties = {
                "class": depth_class
            }
            let geojson = {
                type: 'FeatureCollection',
                name: 'flood_classes',
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                features: [
                    feature
                ]
            }

            const forecast_event_attr = {
                source: source,
                link: source_url,
                notes: event_notes,
                acquisition_date: acquisition_date,
                forecast_date: forecast_date
            };

            const forecast_event = new ForecastEvent(forecast_event_attr);
            this.forecast_event = forecast_event;

            FloodModel.uploadFloodMap({
                geojson: geojson,
                place_name: place_name,
                return_period: return_period,
                flood_model_notes: flood_model_notes})
                .then(function(flood){
                    that.flood = flood;

                    // attach handler
                    that.flood.on('upload-finished', that.uploadFloodFinished, that);
                    that.flood.on('feature-uploaded', that.updateProgress, that);
                    that.setProgressBar(0);

                }).catch(function (error) {
                    console.log(error);
                    if("message" in error){
                        let message = error.message;
                        alert("Upload Failed. " + message);
                    }
                    else {
                        alert("Upload Failed. GeoJSON file parsing failed");
                    }
                    that.$el.find('[type=submit]').show();
                    that.progressbar.hide();
            });
            return false;
        }
    })
});
