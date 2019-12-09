define([
    'backbone',
    'moment'
], function (Backbone) {

    const VillageSummary = Backbone.Model.extend({
        urlRoot: postgresUrl + 'flood_event_village_summary_mv',
        url: function () {
            return `${this.urlRoot}?id=eq.${this.id}`
        }
    });

    return Backbone.Collection.extend({
        model: VillageSummary,
        urlRoot: postgresUrl + 'flood_event_village_summary_mv',
        url: function () {
            return this.urlRoot;
        }
    });
});
