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
        forecasts_list: [],
        event_date_hash: {},
        selected_flood: null,
        building_type: {},
        flood_collection: null,
        flood_on_date: null,
        displayed_flood: null,
        flood_dates: [],
        villageStats: null,
        subDistrictStats: null,
        districtStats: null,
        areaLookup: null,
        fetchedDate: {},
        events: {
            'click #prev-date': 'clickNavigateForecast',
            'click #next-date': 'clickNavigateForecast',
            'mouseleave': 'onFocusOut',
            'blur': 'onFocusOut'
        },
        legend:[],
        initialize: function () {
            this.fetchForecastCollection();
            // jquery element
            this.$flood_info = this.$el.find('.flood-info');
            this.$prev_date_arrow = this.$el.find('#prev-date');
            this.$next_date_arrow = this.$el.find('#next-date');
            this.$datepicker_browse = this.$el.find('#date-browse-flood');
            this.$forecast_arrow_up = this.$el.find('.browse-arrow.arrow-up');
            this.$forecast_arrow_down = this.$el.find('.browse-arrow.arrow-down');
            this.$hide_browse_flood = this.$el.find('.hide-browse-flood');
            this.datepicker_browse = null;

            // dispatcher registration
            dispatcher.on('flood:fetch-forecast-collection', this.fetchForecastCollection, this);
            dispatcher.on('flood:update-forecast-collection', this.initializeDatePickerBrowse, this);
            dispatcher.on('flood:fetch-forecast', this.fetchForecast, this);
            dispatcher.on('flood:fetch-stats-data', this.fetchStatisticData, this)
            dispatcher.on('flood:fetch-flood-vulnerability', this.fetchVulnerability, this);


            // get trigger status legend
            let that = this;
            AppRequest.get(
                postgresUrl + 'trigger_status',
                {},
                null)
                .done(function (data) {
                   data.push({'id':0, 'name': 'No activation'});

                    // render legend
                    let html = '<table class="legend">';
                    data.forEach((value) => {
                        html += '<tr>';
                        if (value.id !== 3) {
                            html += `<td><span class="colour trigger-status-${value.id}"></span><span>${value.name.capitalize()}</span></td>`;
                            html += `<td><span class="colour trigger-status-historical trigger-status-${value.id}"></span><span>Historical ${value.name.capitalize()}</span></td>`;
                        }
                        html += '</tr>';
                    });
                    html +='</table>'
                    $('#date-legend').html(html + '</div>')
                });
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
                inline: true,
                onRenderCell: function (date, cellType) {
                    let date_string = moment(date).formatDate();
                    let event = that.event_date_hash[date_string];
                    if (cellType === 'day' && event) {
                        let classes =  'flood-date trigger-status-' + (event.trigger_status ? event.trigger_status : 0);
                        if(event.is_historical){
                            classes  += ' trigger-status-historical';
                        }
                        return {
                            classes: classes,
                        };
                    }
                },
                onChangeMonth:function (month, year){
                    let today = new moment().utc()
                    today.year(year);
                    today.month(month);
                    today.day(10);
                    that.fetchForecastCollection(today.subtract(1, 'month').startOf('month').utc());
                },
                onSelect: function(fd, date) {
                    if (date) {
                        that.fetchForecast(date);
                    } else {
                        // empty date or deselected;
                        that.deselectForecast();
                    }
                },
                onHide: function(inst) {
                    that.is_browsing = false;
                },
                onShow:function (inst, animationCompleted){
                    that.is_browsing = true;
                }
            });

            // change message
            this.$datepicker_browse.val('Select forecast date');
            this.datepicker_browse = this.$datepicker_browse.data('datepicker');
        },
        fetchForecastCollection: function (startDate) {
            let today = moment().utc();
            if (startDate) {
                today = startDate;
            }
            const that = this;

            let identifier = today.year() + '-' + today.month();
            if(that.fetchedDate[identifier]){
                return;
            }
            // Get flood forecast collection
            // we need to call it per 2 month
            let startOfMonth = today.clone().subtract(1, 'month').startOf('month').utc();
            let endOfMonth = today.clone().add(1, 'month').startOf('month').subtract(1, 'day').utc();

            //check if it's already called
            that.fetchedDate[startOfMonth.year() + '-' + startOfMonth.month()] = true;
            that.fetchedDate[endOfMonth.year() + '-' + endOfMonth.month()] = true;
            ForecastEvent.getCurrentForecastList(startOfMonth, endOfMonth)
                .then(function(data){
                    that.forecasts_list = that.forecasts_list.concat(data);
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

                    that.event_date_hash = Object.assign({}, that.event_date_hash, date_hash);

                    // decorate the date picker here
                    if(!startDate) {
                        dispatcher.trigger('flood:update-forecast-collection', that);
                    }
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
            let that = this;
            this.selected_forecast = forecast;
            dispatcher.trigger('map:draw-forecast-layer', forecast, function () {
                that.fetchAreaLookUp(that.selected_forecast.id);
                that.fetchVillageData(that.selected_forecast.id);
                that.fetchSubDistrictData(that.selected_forecast.id);
                that.fetchDistrictData(that.selected_forecast.id);
            });

            // dispatch event to draw flood
            // change flood info
            let name = forecast.get('notes') ? forecast.get('notes') : '<i>no name</i>';
            this.$flood_info.html(`<div>${name}</div>`);
            // close browser
            this.$hide_browse_flood.click();
        },
        deselectForecast: function(){
            // when no forecast, deselect
            this.selected_forecast = null;
            this.$flood_info.empty();
            this.$datepicker_browse.val('Select forecast date');
            dispatcher.trigger('map:remove-forecast-layer');
            // close browser
            this.$hide_browse_flood.click();
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
        onFocusOut: function(e){
            // if(!this.is_browsing) {
            //     this.$hide_browse_flood.click();
            // }
        },
        clickNavigateForecast: function (e) {
            let date_string = $(e.currentTarget).attr('data-forecast-date');
            let selected_date = moment(date_string);
            // selecting date in date picker will trigger flood selection again.
            this.datepicker_browse.selectDate(selected_date.toJavascriptDate());
        },
        fetchStatisticData: function (region, region_id, renderRegionDetail) {
            if(!region) {
                return []
            }

            let that = this;
            let data = {
                'village': that.villageStats,
                'district': that.districtStats,
                'sub_district': that.subDistrictStats
            };

            let buildings = [];
            let overall = [];
            let region_render;
            let main_panel = true;
            if(renderRegionDetail) {
                region_render = region;
                $.each(data[region], function (idx, value) {
                    buildings[idx] = [];
                    $.each(value, function (key, value) {
                        buildings[idx][key] = value;
                        if (!overall[key]) {
                            overall[key] = value
                        } else {
                            overall[key] += value
                        }
                    })
                });
                if(overall.hasOwnProperty('police_flooded_building_count')) {
                    overall['police_station_flooded_building_count'] = overall['police_flooded_building_count'];
                    delete overall['police_flooded_building_count'];
                }
                delete overall[region + '_id'];
                delete overall['name'];
                delete overall['village_code'];
                delete overall['sub_dc_code'];
            }else {
                main_panel = false;
                let sub_region = 'sub_district';
                if(region === 'sub_district'){
                    sub_region = 'village'
                }
                region_render = sub_region;

                let statData = [];
                let key = {
                    'sub_district': 'sub_district_id',
                    'village': 'village_id'
                };
                let subRegionList = that.getListSubRegion(sub_region, region_id);
                $.each(data[sub_region], function (index, value) {
                    if(subRegionList.indexOf(value[key[sub_region]])){
                        statData.push(value)
                    }
                });

                if(region !== 'village') {
                    $.each(statData, function (idx, value) {
                        buildings[idx] = [];
                        $.each(value, function (key, value) {
                            if(key === 'police_flooded_building_count'){
                                key = 'police_station_flooded_building_count'
                            }
                            buildings[idx][key] = value;
                        })
                    });
                }

                for(let index=0; index<data[region].length; index++){
                    if(data[region][index]['id'] === parseInt(region_id)){
                        overall = data[region][index];
                        if(overall.hasOwnProperty('police_flooded_building_count')) {
                            overall['police_station_flooded_building_count'] = overall['police_flooded_building_count'];
                            delete overall['police_flooded_building_count'];
                        }
                        break
                    }
                }
                overall['region'] = region;
            }
            dispatcher.trigger('dashboard:render-chart-2', overall, main_panel);

            if(region !== 'village') {
                dispatcher.trigger('dashboard:render-region-summary', buildings, region_render)
            }
        },
        fetchVillageData: function (flood_event_id) {
            flood_event_id = 15;
            let that = this;
            this.xhrVillageStats = AppRequest.get(
                postgresUrl + 'flood_event_village_summary_mv?flood_event_id=eq.' + flood_event_id,
                {
                    order: 'id.asc'
                },
                {
                    'Range-Unit': 'items',
                    'Range': '',
                    'Prefer': ''
                },
                function (data, textStatus, request) {
                    that.villageStats = data;
                    if(that.villageStats !== null && that.districtStats !== null && that.subDistrictStats !== null) {
                        that.fetchStatisticData('district', that.selected_forecast.id, true);
                    }
                },function (data, textStatus, request) {
                    console.log('Village stats request failed');
                    console.log(data)
                })
        },
        fetchDistrictData: function (flood_event_id) {
            flood_event_id = 15;
            let that = this;
            this.xhrDistrictStats = AppRequest.get(
                postgresUrl + 'flood_event_district_summary_mv?flood_event_id=eq.' + flood_event_id,
                {
                    order: 'id.asc'
                },
                {
                    'Range-Unit': 'items',
                    'Range': '',
                    'Prefer': ''
                },
                function (data, textStatus, request) {
                    that.districtStats = data;
                    if(that.villageStats !== null && that.districtStats !== null && that.subDistrictStats !== null) {
                        that.fetchStatisticData('district', that.selected_forecast.id, true);
                    }
                },function (data, textStatus, request) {
                    console.log('District stats request failed');
                    console.log(data)
                })
        },
        fetchSubDistrictData: function (flood_event_id) {
            flood_event_id = 15;
            let that = this;
            this.xhrSubDistrictStats = AppRequest.get(
                postgresUrl + 'flood_event_sub_district_summary_mv?flood_event_id=eq.' + flood_event_id,
                {
                    order: 'id.asc'
                },
                {
                    'Range-Unit': 'items',
                    'Range': '',
                    'Prefer': ''
                },
                function (data, textStatus, request) {
                    that.subDistrictStats = data;
                    if(that.villageStats !== null && that.districtStats !== null && that.subDistrictStats !== null) {
                        that.fetchStatisticData('district', that.selected_forecast.id, true);
                    }
                },function (data, textStatus, request) {
                    console.log('Sub district stats request failed');
                    console.log(data)
                })
        },
        fetchAreaLookUp: function (flood_event_id) {
            let that = this;
            this.xhrSubDistrictStats = AppRequest.get(
                postgresUrl + 'flood_event_sub_district_summary_mv?flood_event_id=eq.' + flood_event_id,
                {
                    order: 'id.asc'
                },
                {
                    'Range-Unit': 'items',
                    'Range': '',
                    'Prefer': ''
                },
                function (data, textStatus, request) {
                    that.areaLookup = data;
                },function (data, textStatus, request) {
                    console.log('Area lookup request failed');
                    console.log(data)
                })
        },
        getListSubRegion: function (region, district_id) {
            let key = {
                'sub_district': 'sub_dc_code',
                'village': 'village_code'
            };
            let keyParent = {
                'sub_district': 'dc_code',
                'village': 'sub_dc_code'
            };
            let that = this;
            let listSubRegion = [];
            $.each(that.areaLookup, function (index, value) {
                if(parseInt(value[keyParent[region]]) === parseInt(district_id)){
                    listSubRegion.push(value[key[region]])
                }
            });
            return listSubRegion
        }
    })
});
