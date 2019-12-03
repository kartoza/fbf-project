define([
    'backbone',
    'wellknown'
    ], function (Backbone, Wellknown) {
    /**
     * Attributes:
     *  - flood_map_id
     *  - acquisition_date
     *  - forecast_date
     *  - source
     *  - notes
     *  - link
     *  - trigger_status
     *
     */
    const ForecastEvent = Backbone.Model.extend({
            // attribute placeholder
            _url: {
                forecast_flood: postgresUrl + 'flood_event'
            },
            _table_attrs: {
                forecast_flood: {
                    flood_id: 'flood_map_id',
                    acquisition_date: 'acquisition_date',
                    forecast_date: 'forecast_date',
                    source: 'upload_source',
                    notes: 'notes',
                    link: 'link',
                    trigger_status: 'trigger_status'
                }
            },
            _constants: {
                PRE_ACTIVATION_TRIGGER: 1,
                ACTIVATION_TRIGGER: 2
            },

            urlRoot: postgresUrl + 'flood_event'
        },
        {
            fromFloodLayer: function (flood_layer) {
                const flood_map_id = flood_layer.get('id');
                const forecast = new ForecastEvent({
                    flood_map_id: flood_map_id
                });
                return forecast
            }
        });
    return ForecastEvent;
});
