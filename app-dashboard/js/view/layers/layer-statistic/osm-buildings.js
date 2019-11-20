define([
    'backbone', 'leaflet',
    'js/view/layers/layer-statistic/base.js'], function (
    Backbone, L, Base) {
    return Base.extend({
        xhr: null,
        prefixView: 'flooded_buildings_',
        initialize: function (multiselectFilter, filters) {
            /**
             * multiselect view of backbone
             * Take filters value as the query for update the status
             * **/
            this.listenTo(dispatcher, multiselectFilter.databaseModel + ':update-stats', this.updateStats);
            this.multiselectFilter = multiselectFilter;
            this.filters = filters;
        },
        updateStats: function (types, currentIndex) {
            let that = this;
            if (that.xhr) {
                that.xhr.abort();
            }

            // init loading span
            if (!types) {
                types = [];
                currentIndex = 0;
                this.multiselectFilter.$el.find('span').each(function (index) {
                    let $el = $(this);
                    $el.html('<i class="loading">loading</i>');
                    types.push($el.data('type'));
                });
            }

            // get the type
            let type = types[currentIndex];
            if (!type) {
                return;
            }

            // get the filters
            let postgrestFilters = [];
            for (var i = 0, len = this.filters.length; i < len; i++) {
                if (this.filters[i].postgrestFilter()) {
                    postgrestFilters.push(this.filters[i].postgrestFilter());
                }
            }

            // get list from material view when filter is 0
            if (postgrestFilters.length === 0 && !this.polygonID) {
                AppRequest.get(
                    postgresUrl + 'osm_buildings_mv', [], null,
                    function (data) {
                        $.each(data, (index, row) => {
                            let $el = that.multiselectFilter.$el.find('span[data-type="' + row['building_id'] + '"]');
                            $el.html(row.count);
                        });
                    },
                    function (data) {

                    });
                return;
            }

            // the statistic url
            let url = postgresUrl + this.multiselectFilter.databaseModel + '?building_id=eq.' + type + '&' + postgrestFilters.join('&');
            if (this.polygonID) {
                postgrestFilters.push('flood_id=eq.' + this.polygonID);
                url = postgresUrl + 'osm_buildings_intersect_v' + '?building_id=eq.' + type + '&' + postgrestFilters.join('&');
            }

            let $el = this.multiselectFilter.$el.find('span[data-type="' + type + '"]');
            that.xhr = AppRequest.get(
                url, [],
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
        }
    });
});