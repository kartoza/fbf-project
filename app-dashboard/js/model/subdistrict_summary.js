define([
    'backbone',
    'moment'
], function (Backbone) {

    const SubDistrictSummary = Backbone.Model.extend({
        urlRoot: postgresUrl + 'mv_flood_event_sub_district_summary',
        url: function () {
            return `${this.urlRoot}?id=eq.${this.id}`
        }
    });

    return Backbone.Collection.extend({
        model: SubDistrictSummary,
        urlRoot: postgresUrl + 'mv_flood_event_sub_district_summary',
        url: function () {
            return this.urlRoot;
        }
    });
});
