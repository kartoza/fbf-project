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
    const _flood_event_forecast_list_f_url = postgresUrl + 'rpc/flood_event_forecast_list_f';
    const _flood_event_historical_forecast_list_f_url = postgresUrl + 'rpc/flood_event_historical_forecast_list_f';
    // We define which column to take because we don't want to fetch the whole spreadsheet blob.
    const _select_query_param = 'select=id,flood_map_id,acquisition_date,forecast_date,source,notes,link,trigger_status';
    const ForecastEvent = Backbone.Model.extend({
            // attribute placeholder
            _url: {
                forecast_flood: _forecast_flood_url,
                forecast_flood_extent: postgresUrl + 'vw_flood_event_extent'
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

            initialize: function(){
                this.lead_time();
                this.is_historical();
            },

            url: function () {
                if(this.id){
                    return `${this.urlRoot}?id=eq.${this.id}`;
                }
                else {
                    return this.urlRoot;
                }
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

            /**
             * Return acquisition_date as moment
             */
            acquisition_date: function(){
                return moment.utc(this.attributes.acquisition_date);
            },

            /**
             * Return forecast_date as moment
             *
             */
            forecast_date: function(){
                return moment.utc(this.attributes.forecast_date);
            },

            /**
             * Return Lead Time, which is difference
             */
            lead_time: function(){
                let acquisition_date = this.acquisition_date();
                let forecast_date = this.forecast_date();
                let lead_time = forecast_date.diff(acquisition_date, 'days');
                this.set('lead_time', lead_time);
                return this.attributes.lead_time;
            },

            /**
             * Determine if this is forecast made in the past
             */
            is_historical: function(){
                let acquisition_date = this.acquisition_date();
                let today = moment().local().momentDateOnly();
                let is_historical = acquisition_date.isBefore(today);
                this.set('is_historical', is_historical);
                return is_historical;
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
                    let query_param = `and=(acquisition_date.gte.${acquisition_date_start.format()},acquisition_date.lt.${acquisition_date_end.format()},forecast_date.gte.${forecast_date_start.format()},forecast_date.lt.${forecast_date_end.format()})`;
                    AppRequest.get(`${_forecast_flood_url}?${_select_query_param}&${query_param}`)
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
             * Given a forecast date, retrieve all forecast history of this given date (past forecast result of the same date)
             * @param forecast_date
             */
            getForecastHistory: function(forecast_date){
                return new Promise(function (resolve, reject) {
                    let forecast_date_start = forecast_date.clone().utc();
                    let forecast_date_end = forecast_date_start.clone().add(1, 'days').utc();
                    let query_param = `and=(forecast_date.gte.${forecast_date_start.format()},forecast_date.lt.${forecast_date_end.format()})&order=acquisition_date.desc`;
                    AppRequest.get(`${_forecast_flood_url}?${_select_query_param}&${query_param}`)
                        .done(function (data) {
                            let forecast_events = data.map(function (value) {
                                return new ForecastEvent(value);
                            });
                            resolve(forecast_events);
                        })
                        .catch(reject);
                });
            },

            /**
             * Given range of forecast dates to inspect, return information of forecast history for each date.
             *
             * Each list element is an object with keys:
             * {
             *     total_forecast: total past forecast made for this given forecast date (different acquisition date)
             *     forecast_date: this forecast date, as moment date
             *     minimum_lead_time: minimum lead time made for this forecast date
             *     maximum_lead_time: maximum lead time made for this forecast date
             *     forecast_history(): lazy function to retrieve forecast events (history) list for this date
             * }
             * @param forecast_date_range_start
             * @param forecast_date_range_end
             * @returns {Promise<any>}
             */
            getHistoricalForecastList: function(forecast_date_range_start, forecast_date_range_end){
                return new Promise(function (resolve, reject) {
                    // we make range according to local time, but send it in utc for the db
                    let date_start = forecast_date_range_start.clone().local().momentDateOnly().utc();
                    let date_end = forecast_date_range_end.clone().local().momentDateOnly().utc();

                    AppRequest.post(
                        _flood_event_historical_forecast_list_f_url,
                        {
                            forecast_date_range_start: date_start,
                            forecast_date_range_end: date_end
                        },
                        null,
                        null,
                        'application/json')
                        .done(function (data) {
                            // we will get array of forecast event
                            let forecast_events = data.map(function (value) {
                                let forecast_date = date_start.clone().add(value.relative_forecast_date, 'days').local();
                                return {
                                    total_forecast: value.total_forecast,
                                    forecast_date: forecast_date,
                                    minimum_lead_time: value.minimum_lead_time,
                                    maximum_lead_time: value.maximum_lead_time,
                                    trigger_status_id: value.trigger_status_id,
                                    forecast_history: function () {
                                        return ForecastEvent.getForecastHistory(forecast_date);
                                    }
                                };
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
             * @param acquisition_date
             *      the date (in local time) to inspect the forecast lists for next following days.
             * @returns {Promise<any>}
             */
            getCurrentForecastList: function (acquisition_date) {
                return new Promise(function(resolve, reject){
                    // we make range according to local time for just one day, but send it in utc for the db
                    let acquisition_date_start = acquisition_date.clone().local().momentDateOnly().utc();
                    let acquisition_date_end = acquisition_date_start.clone().add(1, 'days').utc();
                    AppRequest.post(
                        _flood_event_forecast_list_f_url,
                        {
                            acquisition_date_start: acquisition_date_start,
                            acquisition_date_end: acquisition_date_end
                        },
                        null,
                        null,
                        'application/json')
                        .done(function (data) {
                            // we will get array of forecast event
                            let forecast_events = data.map(function (value) {
                                let forecast_date = acquisition_date_start.clone().add(value.lead_time, 'days').local();
                                return {
                                    lead_time: value.lead_time,
                                    total_forecast: value.total_forecast,
                                    forecast_date: forecast_date,
                                    trigger_status_id: value.trigger_status_id,
                                    available_forecasts: function () {
                                        return ForecastEvent.getAvailableForecast(acquisition_date_start, forecast_date);
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
