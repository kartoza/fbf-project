define([
    'backbone',
    'underscore',
    'moment',
    'leaflet',
    'wellknown',
    'utils',
    'js/model/forecast_event.js'
], function (Backbone, _, moment, L, Wellknown, utils, ForecastEvent) {
    return Backbone.View.extend({
        el: '.panel-browse-flood',
        forecasts_list: null,
        event_date_hash: null,
        selected_flood: null,
        building_type: {},

        events: {
            'click #prev-date': 'clickNavigateForecast',
            'click #next-date': 'clickNavigateForecast'
        },
        initialize: function () {
            this.fetchBuildingType();
            this.fetchForecastCollection();
            // jquery element
            this.$flood_info = this.$el.find('.flood-info');
            this.$prev_date_arrow = this.$el.find('#prev-date');
            this.$next_date_arrow = this.$el.find('#next-date');
            this.$datepicker_browse = this.$el.find('#date-browse-flood');
            this.$forecast_arrow_up = this.$el.find('.browse-arrow.arrow-up');
            this.$forecast_arrow_down = this.$el.find('.browse-arrow.arrow-down');
            this.datepicker_browse = null;

            // dispatcher registration
            dispatcher.on('flood:fetch-forecast-collection', this.fetchForecastCollection, this);
            dispatcher.on('flood:update-forecast-collection', this.initializeDatePickerBrowse, this);
            dispatcher.on('flood:fetch-forecast', this.fetchForecast, this);
            dispatcher.on('flood:fetch-flood-vulnerability', this.fetchVulnerability, this);
        },
        initializeDatePickerBrowse: function(){
            const that = this;
            if(this.datepicker_browse){
                // we need to recreate datepicker
                // because the forecast lists has changed
                this.datepicker_browse.destroy();
            }
            this.$datepicker_browse.datepicker({
                language: 'en',
                autoClose: true,
                dateFormat: 'dd/mm/yyyy',
                onRenderCell: function (date, cellType) {
                    let date_string = moment(date).formatDate();
                    if (cellType === 'day' && date_string in that.event_date_hash) {
                        return {
                            classes: 'flood-date'
                        };
                    }
                },
                onSelect: function onSelect(fd, date) {
                    if (date) {
                        that.fetchForecast(date);
                    } else {
                        // empty date or deselected;
                        that.deselectForecast();
                    }
                }
            });

            // change message
            this.$datepicker_browse.val('Select forecast date');
            this.datepicker_browse = this.$datepicker_browse.data('datepicker');
        },
        fetchForecastCollection: function () {
            const today = moment().utc();
            const that = this;

            // Get flood forecast collection
            ForecastEvent.getCurrentForecastList(today)
                .then(function(data){

                    that.forecasts_list = data;

                    // create date hash for easier indexing
                    let date_hash = data.map(function (value) {
                        let date_string = value.forecast_date.local().formatDate();
                        return {
                            [date_string]: value
                        };
                    }).reduce(function (accumulator, value) {
                        _.extend(accumulator, value);
                        return accumulator;
                    }, {});

                    that.event_date_hash = date_hash;

                    // decorate the date picker here
                    dispatcher.trigger('flood:update-forecast-collection', that);
            })
        },
        updateForecastsList: function(forecasts){
            if(forecasts.length > 1){
                // TODO:
                // if more than one forecasts, display forecasts list
            }
            else {
                // TODO:
                // if only single forecast. What to display
            }
        },
        updateForecastsPager: function(current_date){
            // check if there are previous date
            let prev_forecasts = this.forecasts_list.filter(forecast => current_date - forecast.forecast_date.local().momentDateOnly() > 0);
            // do not disable if there are previous date
            this.$prev_date_arrow.prop('disabled', !(prev_forecasts.length > 0));
            // find newest date
            if(prev_forecasts.length > 0 ) {
                let prev_forecast = prev_forecasts.reduce((accumulator, value) => value.forecast_date > accumulator.forecast_date ? value : accumulator, prev_forecasts[0]);
                this.$prev_date_arrow.attr('data-forecast-date', prev_forecast.forecast_date.local().formatDate());
            }
            // check if there are next date
            let next_forecasts = this.forecasts_list.filter(forecast =>  forecast.forecast_date.local().momentDateOnly() - current_date > 0);
            // do not disable if there are previous date
            this.$next_date_arrow.prop('disabled', !(next_forecasts.length > 0));
            // find oldest date
            if(next_forecasts.length > 0 ) {
                let next_forecast = next_forecasts.reduce((accumulator, value) => value.forecast_date < accumulator.forecast_date ? value : accumulator, next_forecasts[0]);
                this.$next_date_arrow.attr('data-forecast-date', next_forecast.forecast_date.local().formatDate());
            }

            // update date text
            this.$datepicker_browse.val(current_date.local().format('DD/MM/YYYY'));
        },
        selectForecast: function(forecast){
            this.selected_forecast = forecast;
            // dispatch event to draw flood
            dispatcher.trigger('map:draw-forecast-layer', forecast);
            // change flood info
            this.$flood_info.html(`<div>${forecast.get('notes')}</div>`);
        },
        deselectForecast: function(){
            // when no forecast, deselect
            this.selected_forecast = null;
            this.$flood_info.empty();
            this.$datepicker_browse.val('Select forecast date');
            dispatcher.trigger('map:remove-forecast-layer');
        },
        fetchForecast: function (date, optional_forecast_id) {
            const that = this;
            // get event aggregate information from date string hash
            let date_string = moment(date).formatDate();
            let forecast_events_aggregate = this.event_date_hash[date_string];

            // if no forecast, do nothing
            if(!forecast_events_aggregate) {
                this.deselectForecast();
                return;
            }

            // fetch forecasts list for the date
            forecast_events_aggregate.available_forecasts()
                .then(function (data) {
                    if(data && data.length > 0 && optional_forecast_id){
                        // if forecast id specified, select that instead of first forecast.
                        data = data.filter(forecast => forecast.get('id') === optional_forecast_id);
                    }
                    if(data && data.length > 0){
                        // for now, select first forecast
                        that.selectForecast(data[0]);
                    }
                    else {
                        that.deselectForecast();
                    }
                    that.updateForecastsList(data);
                    that.updateForecastsPager(moment(date));
                });
        },
        clickNavigateForecast: function (e) {
            let date_string = $(e.currentTarget).attr('data-forecast-date');
            let selected_date = moment(date_string);
            // selecting date in date picker will trigger flood selection again.
            this.datepicker_browse.selectDate(selected_date.toJavascriptDate());
        },
        fetchBuildingType: function () {
            let that = this;
            this.xhrBuildingType = AppRequest.get(
                postgresUrl + 'building_type_class',
                {
                    order: 'id.asc'
                },
                {
                    'Range-Unit': 'items',
                    'Range': '',
                    'Prefer': ''
                },
                function (data, textStatus, request) {
                    $.each(data, function (id, value) {
                        that.building_type[value['id']] = value['building_class']
                    });
                },function (data, textStatus, request) {
                    console.log('Building type request failed');
                    console.log(data)
                })
        },
        fetchVulnerability: function (flood_id) {
            let that = this;
            this.xhrBuildingType = AppRequest.get(
                postgresUrl + 'osm_buildings_intersect_v?flood_id=eq.' + flood_id,
                {
                    order: 'building_id.asc'
                },
                {
                    'Range-Unit': 'items',
                    'Range': '',
                    'Prefer': ''
                },
                function (data, textStatus, request) {
                    let affected_buildings = {};
                    let labels = [];
                    $.each(data, function (idx, value) {
                        let building_type = that.building_type[value['building_id']];
                        if(affected_buildings[building_type]){
                            affected_buildings[building_type]['vulnerability'] += value['total_vulnerability'];
                            affected_buildings[building_type]['count'] += 1;
                        }else {
                            affected_buildings[building_type] = {
                                vulnerability: value['total_vulnerability'],
                                count: 1
                            };
                            labels.push(building_type)
                        }

                    });
                    dispatcher.trigger('dashboard:render-chart', affected_buildings, labels)
                },function (data, textStatus, request) {
                    console.log('Vulnerability request failed');
                    console.log(data);
                    return null
                })
        }
    })
});
