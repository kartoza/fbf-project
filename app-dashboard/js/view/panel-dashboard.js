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
        colour_code: {
            'stop': '#CA6060',
            'stand by': '#D39858',
            'go': '#72CA7A'
        },
        initialize: function () {
            dispatcher.on('dashboard:render-chart', this.renderChart, this);
            dispatcher.on('dashboard:reset', this.resetDashboard, this);
            dispatcher.on('dashboard:hide', this.hideDashboard, this);

            this.$el = $(this.el);
            this.render();
        },
        render: function () {
            let that = this;
            let $action = $(that.status_wrapper);
            $action.html(that.loading_template);
            $('#status').css('background-color', '#D1D3D4');

            let general_template = that.template;
            $(that.general_summary).html(general_template({
                flood_name: floodCollectionView.displayed_flood.name
            }));
            $('#vulnerability-score').html(that.loading_template);
            $('#building-count').html(that.loading_template);
        },
        renderChart: function (data, labels) {
            let graph_data = [];
            let backgroundColours = [];
            let vulnerability_score_total = 0;
            let building_count_total = 0;

            $.each(data, function (key, value) {
                graph_data.push({
                    y: key,
                    x: value['count']
                });
                backgroundColours.push('#82B7CA');
                vulnerability_score_total += value['vulnerability'];
                building_count_total += value['count']
            });

            graph_data.sort(function(a, b){return b.x - a.x});
            var label = [];
            for(var o in graph_data) {
                label.push(graph_data[o].y);
            }

            $('#vulnerability-score').html(vulnerability_score_total.toFixed(2));
            $('#building-count').html(building_count_total);

            let status = 'stop';
            if(vulnerability_score_total > 200){
                status = 'go'
            }else if(vulnerability_score_total >100){
                status = 'stand by'
            }
            this.changeStatus(status);

            var ctx = document.getElementById('summary-chart').getContext('2d');
            var datasets = {
                labels: label,
                datasets: [
                    {
                        label: "Flooded",
                        data: graph_data,
                        backgroundColor: backgroundColours,
                    }]
            };

            new Chart(ctx, {
                type: 'horizontalBar',
                data: datasets,
                options: {
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display:false
                            },
                            ticks: {
                                min: 0
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display:false
                            }
                        }]
                    }
                }
            });
        },
        changeStatus: function (status) {
            $(this.status_wrapper).html(status.toUpperCase() + '!');
            $('#status').css('background-color', this.colour_code[status])
        },
        resetDashboard: function () {
            $('#status').css('background-color', '#D1D3D4');
            $(this.status_wrapper).html('-');
            $(this.general_summary).empty().html('' +
                '<div class="panel-title">' +
                '        Please select a date to see flood forecast data.' +
                '    </div>');
        },
        hideDashboard: function () {
            let $datepicker = $('.datepicker-browse');
            let datepicker_data = $datepicker.datepicker().data('datepicker');
            datepicker_data.clear();
            $('#panel-dashboard').hide();
        }
    })
});