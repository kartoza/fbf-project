define([
    'backbone', 'underscore', 'leaflet', 'wellknown'
], function (Backbone, _, L, Wellknown) {
    return Backbone.View.extend({
        flood_collection: null,
        flood_on_date: null,
        initialize: function () {
            this.fetchFloodCollection();
            dispatcher.on('flood:fetch-flood', this.fetchFlood, this);
            dispatcher.on('flood:fetch-flood-by-id', this.fetchFloodByID, this)
        },
        fetchFloodCollection: function () {
            let $floodListBtn = $('#date-browse-flood');
            let that = this;
            this.xhrPolygon = AppRequest.get(
                postgresUrl + 'flood_wkt_view',
                {
                    order: 'forecast_date_time.asc'
                },
                {
                    'Range-Unit': 'items',
                    'Range': '',
                    'Prefer': ''
                },
                function (data, textStatus, request) {
                    $floodListBtn.val('Select a date');

                    let flood_dates = [];
                    let flood_collection_array = {};
                    $.each(data, function (index, value) {
                        if (value['forecast_date_time'] !== null) {
                            let date = new Date(value['forecast_date_time'] + 'Z');

                            date.setUTCHours(0, 0, 0, 0);
                            let string_date = date.toISOString();

                            if(!flood_collection_array.hasOwnProperty(string_date)){
                                flood_collection_array[string_date] = [value]
                            }else {
                                flood_collection_array[string_date].push(value)
                            }

                            flood_dates.push(string_date)
                        }
                    });
                    that.flood_collection = flood_collection_array;

                    $('.datepicker-browse').datepicker({
                        language: 'en',
                        autoClose: true,
                        dateFormat: 'dd/mm/yyyy',
                        onRenderCell: function (date, cellType) {
                            let _date = new Date(date);
                            _date.setTime(_date.getTime() - _date.getTimezoneOffset() * 60 * 1000);
                            _date.setUTCHours(0,0,0,0);
                            if (cellType === 'day' && flood_dates.indexOf(_date.toISOString()) > -1) {
                                return {
                                    classes: 'flood-date'
                                }
                            }
                        },
                        onSelect: function onSelect(fd, date) {
                            let flood_data = that.fetchFlood(date);
                            if(flood_data != null) {
                                let polygon = Wellknown.parse('SRID=4326;' + flood_data[0]['st_astext']);
                                dispatcher.trigger('map:draw-geojson', polygon);
                                $('.flood-info').html('<div>' + flood_data[0].name + '</div>');
                                if(flood_data.length > 1){
                                    $('.browse-arrow').show();
                                    $('.arrow-down').attr('data-flood-id', flood_data[1]['id']).prop('disabled', false);
                                }else {
                                    $('.browse-arrow').prop('disabled', true).hide();
                                }
                            }else {
                                $('.flood-info').html('');
                                dispatcher.trigger('map:remove-geojson');
                                $('.browse-arrow').prop('disabled', true).hide();
                            }
                        }
                    });

                    $('.btn-change-date').prop('disabled', false)
                },
                function (data, textStatus, request) {
                    $floodListBtn.val('Fetching flood data failed.');
                    console.log(data);
                });
        },
        fetchFlood: function (date) {
            if(date) {
                let that = this;
                let _date = new Date(date);
                _date.setTime(_date.getTime() - _date.getTimezoneOffset() * 60 * 1000);
                _date.setUTCHours(0, 0, 0, 0);
                let string_date = _date.toISOString();
                that.flood_on_date = that.flood_collection[string_date];
                
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
        }
    })
});