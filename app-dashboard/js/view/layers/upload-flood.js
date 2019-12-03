define([
    'backbone',
    'underscore',
    'jquery',
    'js/model/flood.js',
    'js/model/forecast_event.js'
], function (Backbone, _, $, FloodModel, ForecastEvent) {
    return Backbone.View.extend({
        el: "#upload-flood-form",
        events: {
            'submit': 'submitForm'
        },

        initialize: function(){
            this.progressbar = this.$el.find("#upload-progress-bar");
            this.progressbar.hide();
        },

        submitForm: function(e){
            e.preventDefault();
            this.$el.find('[type=submit]').hide();
            this.progressbar.show();

            // make flood model map
            const $form = this.$el;
            const place_name = $form.find("#place_name").val();
            const source = $form.find("#source").val();
            const event_notes = $form.find("#event_notes").val();
            const flood_model_notes = $form.find("#flood_model_notes").val();
            const source_url = $form.find("#source_url").val();
            const geojson = $form.find("#geojson")[0].files;
            const return_period = $form.find("#return_period").val();
            const acquisition_date = new Date($('#acquisition_date_upload').val()).toMysqlFormat();
            const forecast_date = new Date($('#forecast_date_upload').val()).toMysqlFormat();


            const forecast_event_attr = {
                source: source,
                link: source_url,
                notes: event_notes,
                acquisition_date: acquisition_date,
                forecast_date: forecast_date
            };

            const forecast_event = new ForecastEvent(forecast_event_attr);
            this.forecast_event = forecast_event;

            const that = this;
            FloodModel.uploadFloodMap({
                files: geojson,
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
        },

        uploadFloodFinished: function (layer) {
            // upload forecast event
            this.forecast_event.set({
                flood_map_id: layer.get('id')
            });
            this.forecast_event.save();

            alert('Flood map successfully uploaded.');
            this.$el.find('[type=submit]').show();
            this.progressbar.hide();
        },

        setProgressBar: function(value){
            this.progressbar.find(".progress-bar")
                .css("width", value+"%")
                .attr("aria-valuenow", value)
                .attr("aria-valuemin", 0)
                .attr("aria-valuemax", 100);
        },

        updateProgress: function (feature) {
            if(this.flood.featureCount() > 0){
                let progress = this.flood.uploadedFeatures() * 100 / this.flood.featureCount();
                this.setProgressBar(progress);
            }
        }
    })
})
