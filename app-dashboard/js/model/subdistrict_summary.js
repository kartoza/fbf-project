define([
    'backbone',
    'moment'
], function (Backbone) {

    const SubDistrictSummary = Backbone.Model.extend({
        urlRoot: postgresUrl + 'flood_event_sub_district_summary_mv',
        url: function () {
            return `${this.urlRoot}?id=eq.${this.id}`
        }
    });

    return Backbone.Collection.extend({
        model: SubDistrictSummary,
        urlRoot: postgresUrl + 'flood_event_sub_district_summary_mv',
        url: function () {
            return this.urlRoot;
        }
    });
});
