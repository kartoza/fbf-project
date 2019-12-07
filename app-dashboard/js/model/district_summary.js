define([
    'backbone',
    'moment'
], function (Backbone) {

    const DistrictSummary = Backbone.Model.extend({
        urlRoot: postgresUrl + 'flood_event_district_summary',
        url: function () {
            return `${this.urlRoot}?id=eq.${this.id}`
        }
    });

    return Backbone.Collection.extend({
        model: DistrictSummary,
        urlRoot: postgresUrl + 'flood_event_district_summary',
        url: function () {
            return this.urlRoot;
        }
    });
});
