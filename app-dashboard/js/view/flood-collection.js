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
        initialize: function () {
            this.fetchBuildingType();
            this.fetchFloodCollection();
            // jquery element
            this.$flood_info = this.$el.find('.flood-info');
            this.$prev_date_arrow = this.$el.find('#prev-date');
            this.$next_date_arrow = this.$el.find('#next-date');
            this.$datepicker_browse = this.$el.find('#date-browse-flood');
            this.$forecast_arrow_up = this.$el.find('.browse-arrow.arrow-up');
            this.$forecast_arrow_down = this.$el.find('.browse-arrow.arrow-down');
            this.datepicker_browse = this.$datepicker_browse.data('datepicker');

            // dispatcher registration
            dispatcher.on('flood:fetch-flood', this.fetchForecast, this);
            dispatcher.on('flood:fetch-flood-by-id', this.fetchFloodByID, this);
            dispatcher.on('flood:fetch-flood-vulnerability', this.fetchVulnerability, this);
        },
        fetchFloodCollection: function () {
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
                    $('.datepicker-browse').datepicker({
                        language: 'en',
                        autoClose: true,
                        dateFormat: 'dd/mm/yyyy',
                        onRenderCell: function (date, cellType) {
                            let date_string = moment(date).formatDate();
                            if( cellType === 'day' && date_string in date_hash){
                                return {
                                    classes: 'flood-date'
                                };
                            }
                        },
                        onSelect: function onSelect(fd, date) {
                            that.fetchForecast(date);
                        }
                    });

                    // change message
                    that.$datepicker_browse.val('Select forecast date');
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
            let prev_date = this.forecasts_list.filter(forecast => current_date - forecast.forecast_date.local().momentDateOnly());
            // do not disable if there are previous date
            this.$prev_date_arrow.prop('disabled', !(prev_date.length > 0));
            // check if there are next date
            let next_date = this.forecasts_list.filter(forecast =>  forecast.forecast_date.local().momentDateOnly() - current_date);
            // do not disable if there are previous date
            this.$next_date_arrow.prop('disabled', !(next_date.length > 0));
        },
        selectForecast: function(forecast){
            this.selected_forecast = forecast;
            // dispatch event to draw flood
            dispatcher.trigger('map:draw-forecast-layer', forecast);
            // change flood info
            console.log(forecast);
            this.$flood_info.html(`<div>${forecast.get('notes')}</div>`);
        },
        deselectForecast: function(){
            // when no forecast, deselect
            this.selected_forecast = null;
            this.$flood_info.empty();
            dispatcher.trigger('map:remove-forecast-layer');
        },
        fetchForecast: function (date) {
            const that = this;
            // get event aggregate information from date string hash
            let date_string = moment(date).formatDate();
            let forecast_events_aggregate = this.event_date_hash[date_string];
            // fetch forecasts list for the date
            forecast_events_aggregate.available_forecasts()
                .then(function (data) {
                    if(data && data[0]){
                        // for now, select first forecast
                        that.selectForecast(data[0]);
                    }
                    else {
                        that.deselectForecast();
                    }
                    that.updateForecastsList(data);
                    that.updateForecastsPager(moment(date));
                });
            if(date) {
                let that = this;
                let _date = new Date(date);
                _date.setTime(_date.getTime() - _date.getTimezoneOffset() * 60 * 1000);
                _date.setUTCHours(0, 0, 0, 0);
                let string_date = _date.toISOString();
                that.flood_on_date = that.forecasts_list[string_date];
                
                return that.flood_on_date
            }else {
                return null
            }
        },
        fetchFloodByID: function (id) {
            let that = this;
            let lengthArray = that.flood_on_date.length - 1;

            for(var i=0; i<lengthArray + 1; i++) {
                let flood = that.flood_on_date[i];
                if(flood['id'] === parseInt(id)){
                    that.displayed_flood = flood;
                    that.fetchVulnerability(flood['id']);
                    let prev = '';
                    let after = '';

                    if (i > 0) {
                        prev = that.flood_on_date[i - 1]['id'];
                        $('.arrow-up').prop('disabled', false).attr('data-flood-id', prev);
                    } else {
                        $('.arrow-up').prop('disabled', true)
                    }

                    if (i < lengthArray) {
                        after = that.flood_on_date[i + 1]['id'];
                        $('.arrow-down').prop('disabled', false).attr('data-flood-id', after);
                    } else {
                        $('.arrow-down').prop('disabled', true)
                    }
                    $('.flood-info').html('<div>' + flood['name'] + '</div>');

                    let polygon = Wellknown.parse('SRID=4326;' + flood['st_astext']);
                    dispatcher.trigger('map:draw-geojson', polygon);
                    break;
                }
            }
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
