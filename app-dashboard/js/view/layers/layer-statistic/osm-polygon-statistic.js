define([
    'backbone', 'leaflet', 'js/view/layers/flood-form.js'], function (
    Backbone, L, FloodForm) {
    return Backbone.View.extend({
        xhrPolygon: null,
        polygon: null,
        polygonName: null,
        polygonID: null,
        initialize: function (statistics) {
            /**
             * multiselect view of backbone
             * Take filters value as the query for update the status
             * **/
            this.listenTo(dispatcher, 'map:update-polygon', this.updatePolygon);
            this.statistics = statistics;
        },
        deletePolygon: function () {
            this.polygon = null;
            if (this.polygonID) {
                AppRequest.delete(
                    postgresUrl + 'flood?id=eq.' + this.polygonID,
                    {},
                    null,
                    null);
            }
            this.polygonName = null;
            this.polygonID = null;
        },
        updatePolygon: function (polygon) {
            let that = this;
            this.deletePolygon();
            this.polygon = polygon;
            $.each(this.statistics, (index, statistic) => {
                statistic.loading();
            });
            if (this.polygon) {
                let flood_form = new FloodForm(this.polygon);
                let post_data = flood_form.post_data;

                that.xhrPolygon = AppRequest.post(
                    postgresUrl + 'flood',
                    post_data,
                    function (data, textStatus, response) {
                        if (response.status === 201) {
                            // get the id
                            that.xhrPolygon = AppRequest.get(
                                // created object were given via Location header
                                postgresBaseUrl + response.getResponseHeader('Location'),
                                null,
                                null,
                                function (data) {
                                    if (data && data[0]) {
                                        that.polygonID = data[0].id;
                                        that.polygonName = post_data['name'];
                                        that.updateStats();
                                        dispatcher.trigger('map:redraw');
                                    }
                                },
                                function (data, textStatus, request) {
                                    console.log(data);
                                });
                        }
                    });
            } else {
                that.updateStats(null);
            }
        },
        updateStats: function () {
            let that = this;
            $.each(this.statistics, (index, statistic) => {
                statistic.polygonName = that.polygonName;
                statistic.polygonID = that.polygonID;
                statistic.updateStats();
            });
        }
    });
});
