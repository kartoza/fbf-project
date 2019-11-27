define([
    'backbone', 'leaflet'], function (
    Backbone, L) {
    return Backbone.View.extend({
        post_data: {},
        initialize: function (polygon) {
            this.create_data(polygon)
        },
        create_data: function (polygon) {
            let polygonName = (new Date()).toISOString().replaceAll(':', '_');
            polygonName = polygonName.replaceAll('-', '_');
            polygonName = polygonName.replaceAll('T', '_');
            polygonName = polygonName.split('.')[0];
            polygonName = 'flood_' + polygonName;
            let post_data = {
                'geometry': polygon,
                'name': polygonName,
                'reporting_date_time': new Date().toMysqlFormat(),
                'source': 'user'
            };

            if ($('#enable_forecast_date').is(':checked')) {
                post_data['forecast_date_time'] = new Date($('#forecast_date').val()).toMysqlFormat();
            }

            if ($('#enable_station').is(':checked')) {
                post_data['station'] = $('#station').val();
            }
            this.post_data = post_data
        }
    })
});