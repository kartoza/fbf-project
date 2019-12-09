define([
    'backbone',
    'moment'
], function (Backbone) {

    const TriggerStatus = Backbone.Model.extend({
        urlRoot: postgresUrl + 'trigger_status',
        url: function () {
            return `${this.urlRoot}?id=eq.${this.id}`
        }
    });

    return Backbone.Collection.extend({
            model: TriggerStatus,
            urlRoot: postgresUrl + 'trigger_status',
            url: function () {
                return this.urlRoot;
            }
        },
        {
            constants: {
                NOT_ACTIVATED: 0,
                PRE_ACTIVATION: 1,
                ACTIVATION: 2
            }
        });
});
