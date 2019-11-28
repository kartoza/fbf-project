define([
    'backbone',
    'underscore',
    'jquery',
    'js/model/flood.js'
], function (Backbone, _, $, FloodModel) {
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

                })
            return false;
        },

        uploadFloodFinished: function (e) {
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
