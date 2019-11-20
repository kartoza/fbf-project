define([
    'backbone', 'leaflet',
    'js/view/layers/layer-statistic/base.js'], function (
    Backbone, L, Base) {
    return Base.extend({
        xhrByType: null,
        polygonID: null,
        updateStats: function (types, currentIndex) {
            let that = this;
            if (that.xhr) {
                that.xhr.abort();
            }

            //init data
            if (!types) {
                types = [];
                currentIndex = 0;
                this.multiselectFilter.$el.find('span').each(function (index) {
                    let $el = $(this);
                    $el.html('<i class="loading">loading</i>');
                    types.push($el.data('type'));
                });
            }

            // call it
            let type = types[currentIndex];
            if (!type) {
                return;
            }

            if (!this.polygonID) {
                // this is for not filtered by polygon
                let url = postgresUrl + this.multiselectFilter.databaseModel;
                let $el = this.multiselectFilter.$el.find('span[data-type="' + type + '"]');
                $el.html('<i class="loading">loading</i>');
                that.xhr = AppRequest.get(
                    url + '?waterway_id=eq.' + type, [],
                    {
                        'Range-Unit': 'items',
                        'Range': '0-0',
                        'Prefer': 'count=exact'
                    },
                    function (data, textStatus, request) {
                        let count = request.getResponseHeader('Content-Range').split('/')[1];
                        $el.html(count);
                        that.updateStats(types, currentIndex + 1);
                    },
                    function (data) {
                        $el.html('<i>failed</i>');
                        if (data['statusText'] != 'abort') {
                            that.updateStats(types, currentIndex + 1);
                        }
                    });
            } else {
                // this is for not filtered by polygon
                let url = postgresUrl + 'osm_waterways_flood_count_v?flood_id=eq.' + this.polygonID;
                that.xhr = AppRequest.get(
                    url, [], {},
                    function (data, textStatus, request) {
                        that.multiselectFilter.$el.find('span').each(function (index) {
                            let $el = $(this);
                            $el.html(0);
                        });

                        // assign the statistic data into each other
                        $.each(data, (index, row) => {
                            let $el = that.multiselectFilter.$el.find('span[data-type="' + row.waterway_id + '"]');
                            $el.html(row.count)
                        });
                    },
                    function (data) {
                        that.multiselectFilter.$el.find('span').each(function (index) {
                            let $el = $(this);
                            $el.html('<i>failed</i>');
                        });
                    });

            }
        }
    });
});