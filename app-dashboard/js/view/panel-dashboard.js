define([
    'backbone',
    'underscore',
    'jquery',
    'jqueryUi',
    'chartjs'
], function (Backbone, _, $, JqueryUi, Chart) {
    return Backbone.View.extend({
        template: _.template($('#dashboard-template').html()),
        loading_template: '<i class="fa fa-spinner fa-spin fa-fw"></i>',
        status_wrapper: '#action-status',
        general_summary: '#flood-general-summary',
        sub_summary: '#flood-sub-summary',
        el: '#panel-dashboard',
        referer_region: [],
        sub_region_title_template: _.template($('#region-title-panel-template').html()),
        sub_region_item_template: _.template($('#region-summary-panel-template').html()),
        colour_code: {
            'Stop': '#CA6060',
            'Stand by': '#D39858',
            'REACHED - Activate your EAP': '#72CA7A'
        },
        events: {
            'click .drilldown': 'drilldown',
            'click .btn-back-summary-panel': 'backPanelDrilldown'
        },
        initialize: function () {
            this.referer_region = [];
            dispatcher.on('dashboard:render-chart-2', this.renderChart2, this);
            dispatcher.on('dashboard:reset', this.resetDashboard, this);
            dispatcher.on('dashboard:hide', this.hideDashboard, this);
            dispatcher.on('dashboard:render-region-summary', this.renderRegionSummary, this);

            this.$el = $(this.el);
        },
        render: function () {
            this.referer_region = [];
            let that = this;
            let $action = $(that.status_wrapper);
            $action.html(that.loading_template);
            $('#status').css('background-color', '#D1D3D4');

            let general_template = that.template;

            let flood_acquisition_date = new Date(floodCollectionView.selected_forecast.attributes.acquisition_date);
            let flood_forecast_date = new Date(floodCollectionView.selected_forecast.attributes.forecast_date);

            $(that.general_summary).html(general_template({
                flood_name: floodCollectionView.selected_forecast.attributes.notes,
                acquisition_date: flood_acquisition_date.getDate() + ' ' + monthNames[flood_acquisition_date.getMonth()] + ' ' + flood_acquisition_date.getFullYear(),
                forecast_date: flood_forecast_date.getDate() + ' ' + monthNames[flood_forecast_date.getMonth()] + ' ' + flood_forecast_date.getFullYear(),
                source: floodCollectionView.selected_forecast.attributes.source,
                notes: floodCollectionView.selected_forecast.attributes.notes,
                link: floodCollectionView.selected_forecast.attributes.link
            }));
            $('#vulnerability-score').html(that.loading_template);
            $('#building-count').html(that.loading_template);
        },
        renderChart2: function (data, main_panel) {
            let that = this;
            if(main_panel){
                $('.btn-back-summary-panel').hide();
                let referer = {
                    region: 'district',
                    id: 'main'
                };
                if(!that.containsReferer(referer, that.referer_region)) {
                    that.referer_region.push(referer);
                }
                $('#main-panel-header').html('Summary for Flood ' + floodCollectionView.selected_forecast.attributes.notes)
            }else {
                $('.btn-back-summary-panel').show();
                let region = data['region'];
                let referer = {
                    region: region,
                    id: data['id']
                };
                if(!that.containsReferer(referer, that.referer_region)) {
                    that.referer_region.push(referer);
                }
                $('#main-panel-header').html('Summary For ' + toTitleCase(region.replace('_', ' ')) + ' ' + data["name"])
            }

            let $parentWrapper = $('#chart-score-panel');
            $parentWrapper.find('#summary-chart').remove();
            $parentWrapper.find('.panel-chart').html('<canvas id="summary-chart"></canvas>');
            $('#region-summary-panel').html('');

            let total_building_array = [];
            let graph_data = [];
            let flood_graph_data = [];
            let backgroundColours = [];
            let unlisted_key = [
                'id', 'flood_event_id', 'vulnerability_total_score', 'flooded_building_count', 'building_count',
                'village_id', 'name', 'region', 'district_id', 'sub_district_id', 'sub_dc_code', 'village_code', 'dc_code'
            ];
            for(var key in data) {
                if(unlisted_key.indexOf(key) === -1 && key.indexOf('flood') > -1) {
                    flood_graph_data.push({
                        y: key.replace('_flooded_building_count', ''),
                        x: data[key]
                    });
                }

                if(unlisted_key.indexOf(key) === -1 && key.indexOf('flood') === -1) {
                    let flood_key = key.replace('_building_count', '_flooded_building_count');
                    let count = data[key] - data[flood_key];
                    if(!count === NaN){
                        count = 0
                    }
                    graph_data.push({
                        y: key.replace('_building_count', ''),
                        x: count
                    });

                    total_building_array.push({
                        key: key.replace('_building_count', ''),
                        value: data[key]
                    })
                }
                backgroundColours.push('#82B7CA');
            }

            total_building_array.sort(function(a, b){return b.value - a.value});

            var label = [];
            for(var o in total_building_array) {
                label.push(total_building_array[o].key);
            }

            graph_data.sort(function(a, b){
              return label.indexOf(a.y) - label.indexOf(b.y);
            });

            flood_graph_data.sort(function(a, b){
              return label.indexOf(a.y) - label.indexOf(b.y);
            });

            let humanLabel = [];
            for(let i=0; i<label.length; i++) {
                humanLabel.push(toTitleCase(label[i].replace('_', ' ')))
            }

            var ctx = document.getElementById('summary-chart').getContext('2d');
            var datasets = {
                labels: humanLabel,
                datasets: [
                    {
                        label: "Not Flooded",
                        data: graph_data
                    }, {
                        label: "Flooded",
                        data: flood_graph_data,
                        backgroundColor: backgroundColours
                    }]
            };

            $('#vulnerability-score').html(data['vulnerability_total_score'].toFixed(2));
            $('#building-count').html(data['flooded_building_count']);

            new Chart(ctx, {
                type: 'horizontalBar',
                data: datasets,
                options: {
                    scales: {
                        xAxes: [{
                            stacked: true,
                            gridLines: {
                                display:false
                            },
                            ticks: {
                                min: 0
                            }
                        }],
                        yAxes: [{
                            stacked: true,
                            gridLines: {
                                display:false
                            },
                        }]
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            let status = 'Stop';
            if(data['vulnerability_total_score'] > 200){
                status = 'REACHED - Activate your EAP'
            }else if(data['vulnerability_total_score'] >100){
                status = 'Stand by'
            }
            this.changeStatus(status);
        },
        renderRegionSummary: function (data, region) {
            let $wrapper = $('#region-summary-panel');
            let title = this.sub_region_title_template;
            $wrapper.html(title({
                region: toTitleCase(region.replace('_', ''))
            }));
            let item_template = this.sub_region_item_template;
            let $table = $('<table></table>');
            for(let u=0; u<data.length; u++){
                let item = data[u];
                $table.append(item_template({
                    region: region,
                    id: item['id'],
                    name: item['name'],
                    flooded_vulnerability_total: item['vulnerability_total_score'].toFixed(2),
                    flooded_building_count: item['flooded_building_count']
                }));
            }
            $wrapper.append($table);
        },
        changeStatus: function (status) {
            $(this.status_wrapper).html(status.toUpperCase() + '!');
            $('#status').css('background-color', this.colour_code[status])
        },
        resetDashboard: function () {
            this.referer_region = [];
            $('#status').css('background-color', '#D1D3D4');
            $(this.status_wrapper).html('-');
            $(this.general_summary).empty().html('' +
                '<div class="panel-title">' +
                '        No data available.' +
                '    </div>');
        },
        hideDashboard: function () {
            this.referer_region = [];
            let $datepicker = $('.datepicker-browse');
            let datepicker_data = $datepicker.data('datepicker');
            datepicker_data.clear();
            $('#panel-dashboard').hide();
        },
        drilldown: function (e) {
            let that = this;
            let $button = $(e.target).closest('.drilldown');
            let region = $button.attr('data-region');
            let region_id = parseInt($button.attr('data-region-id'));
            $('.btn-back-summary-panel').attr('data-region', that.referer_region[that.referer_region.length - 1].region).attr('data-region-id', that.referer_region[that.referer_region.length -1].id);
            dispatcher.trigger('flood:fetch-stats-data', region, region_id, false);
        },
        backPanelDrilldown: function (e) {
            let that = this;
            this.referer_region.pop();

            let $button = $(e.target).closest('.btn-back-summary-panel');
            let region = $button.attr('data-region');
            let region_id = $button.attr('data-region-id');
            let main = false;
            if(region_id === 'main'){
                main = true
            }

            let referer_region = '';
            let referer_region_id = '';
            try {
                referer_region = that.referer_region[that.referer_region.length - 1].region;
                referer_region_id = that.referer_region[that.referer_region.length - 1].id;
            }catch (err){

            }

            $('.btn-back-summary-panel').attr('data-region', referer_region).attr('data-region-id', referer_region_id);
            dispatcher.trigger('flood:fetch-stats-data', region, region_id, main);
        },
        containsReferer: function (obj, list) {
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i].region === obj.region && list[i].id === obj.id) {
                    return true;
                }

                if (list[i].region === obj.region && list[i].id !== 'main') {
                    return true;
                }
            }

            return false;
        }
    })
});
