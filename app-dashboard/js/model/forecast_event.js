define([
    'backbone',
    'wellknown',
    'leaflet',
    'moment'],
    function (Backbone, Wellknown, L, moment) {
    /**
     * Attributes:
     *  - flood_map_id
     *  - acquisition_date
     *  - forecast_datex
     *  - source
     *  - notes
     *  - link
     *  - trigger_status
     *
     */
    const _forecast_flood_url = postgresUrl + 'flood_event';
    const _flood_event_forecast_list_f_url = postgresUrl + 'rpc/flood_event_newest_forecast_f';
    const ForecastEvent = Backbone.Model.extend({
            // attribute placeholder
            _url: {
                forecast_flood: _forecast_flood_url,
                forecast_flood_extent: postgresUrl + 'flood_event_extent_v'
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
                ACTIVATION_TRIGGER: 2,
                WMS_LAYER_NAME: 'kartoza:flood_forecast_layer'
            },

            urlRoot: postgresUrl + 'flood_event',

            url: function () {
                return `${this.urlRoot}?id=eq.${this.get('id')}`;
            },

            fetchExtent: function () {
                const that = this;
                return new Promise(function (resolve, reject) {
                    AppRequest.get(
                        that._url.forecast_flood_extent,
                        {
                            id: `eq.${that.get('id')}`
                        },
                        {
                            'Accept': 'application/vnd.pgrst.object+json'
                        })
                        .done(function (data) {
                            let extent = {
                                x_min: data.x_min,
                                x_max: data.x_max,
                                y_min: data.y_min,
                                y_max: data.y_max,
                                leaflet_bounds: [
                                    [data.y_min, data.x_min],
                                    [data.y_max, data.x_max]
                                ]
                            }
                            that.set('extent', extent);
                            resolve(extent);
                        })
                        .fail(reject);
                });
            },

            leafletLayer: function () {
                return L.tileLayer.wms(
                    geoserverUrl,
                    {
                        layers: this._constants.WMS_LAYER_NAME,
                        format: 'image/png',
                        transparent: true,
                        srs: 'EPSG:4326',
                        cql_filter: `id=${this.get('id')}`
                    });
            }
        },
        {
            fromFloodLayer: function (flood_layer) {
                const flood_map_id = flood_layer.get('id');
                const forecast = new ForecastEvent({
                    flood_map_id: flood_map_id
                });
                return forecast
            },

            /**
             * Given an acquisition date (when the forecast created)
             * and forecast date (when the event will happen/forecasted),
             * retrieve the forecast information available for that forecast date.
             * Return promise of forecast array (in case more than one forecast for a given date).
             * @param acquisition_date
             * @param forecast_date
             * @returns {Promise<ForecastEvent>}
             */
            getAvailableForecast: function(acquisition_date, forecast_date){
                return new Promise(function(resolve, reject){
                    let acquisition_date_start = acquisition_date.clone().utc();
                    let acquisition_date_end = acquisition_date_start.clone().add(1, 'days').utc();
                    let forecast_date_start = forecast_date.clone().utc();
                    let forecast_date_end = forecast_date_start.clone().add(1, 'days').utc();
                    let query_param = `?and=(acquisition_date.gte.${acquisition_date_start.format()},acquisition_date.lt.${acquisition_date_end.format()},forecast_date.gte.${forecast_date_start.format()},forecast_date.lt.${forecast_date_end.format()})`;
                    AppRequest.get(_forecast_flood_url + query_param)
                        .done(function(data){
                            // we will get array of forecast event
                            let forecast_events = data.map(function(value){
                                return new ForecastEvent(value);
                            });
                            resolve(forecast_events);
                        })
                        .catch(reject);
                });
            },

            /**
             * Given an acquisition date (when the forecast created),
             * return a list of number of forecast for range of dates
             *
             * Each list element is an object with keys:
             * {
             *     - lead_time: number of days after acquisition date,
             *     - forecast_date: date of forecast event
             *     - total_forecast: total forecast available in that date
             *     - forecasts_list(): lazy function to evaluate forecasts lists in this date
             * }
             *
             * @param startDate
             * @param endDate
             * @returns {Promise<any>}
             */
            getCurrentForecastList: function (startDate, endDate) {
                return new Promise(function(resolve, reject){
                    let today = moment().utc().format().split('T')[0];
                    AppRequest.post(
                        _flood_event_forecast_list_f_url,
                        {
                            forecast_date_start: startDate.format(),
                            forecast_date_end: endDate.format()
                        },
                        null,
                        null,
                        'application/json')
                        .done(function (data) {
                            // we will get array of forecast event
                            let forecast_events = data.filter(
                                function (value) {
                                    let isHistorical = today >value.acquisition_date_str;
                                    let isForecastInFuture = today <= value.forecast_date_str;
                                    if (isHistorical && isForecastInFuture) {
                                        return false;
                                    }
                                    value.is_historical = isHistorical;
                                    return true;
                                }).map(
                                function (value) {
                                    let forecastDate = moment.utc(value.forecast_date_str);
                                    let acquisitionDate = moment.utc(value.acquisition_date_str);
                                    return {
                                        trigger_status: value.trigger_status_id,
                                        forecast_date: forecastDate,
                                        is_historical: value.is_historical,
                                        available_forecasts: function () {
                                            return ForecastEvent.getAvailableForecast(acquisitionDate, forecastDate);
                                        }
                                    };
                                });
                            resolve(forecast_events);
                        })
                        .catch(reject);
                });
            }
        });
    return ForecastEvent;
});
