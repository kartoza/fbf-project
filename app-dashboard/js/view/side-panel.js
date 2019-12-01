define([
    'backbone',
    'underscore',
    'jquery',
    'jqueryUi',
    'js/view/layers/upload-flood.js',
    'js/view/panel-dashboard.js',
], function (Backbone, _, $, JqueryUi, FloodUploadView, DashboardView) {
    return Backbone.View.extend({
        el: "#side-panel",
        events: {
            'click .add-flood-scenario': 'openPanelFloodScenario',
            'click .btn-back': 'backButtonAction',
            'click #upload-flood': 'openUploadFloodForm',
            'click .browse-floods': 'openBrowseFlood',
            'click .hide-browse-flood': 'hideBrowseFlood',
            'click .browse-arrow': 'fetchFloodById',
            'click #btn-browse-forecast': 'openBrowseByForecast',
            'click #btn-browse-return-period': 'openBrowseByReturnPeriod',
            'click #prev-date': 'clickPrevDate',
            'click #next-date': 'clickNextDate'
        },
        initialize: function () {
            let that = this;
            $('.add-flood-scenario').click(function () {
                that.openPanelFloodScenario()
            });

            $('.browse-floods').click(function () {
                that.openBrowseFlood()
            });

            // Initialize view
            this.flood_upload_view = new FloodUploadView();
            dispatcher.on('side-panel:open-dashboard', this.openDashboard, this)
            dispatcher.on('side-panel:open-welcome', this.openWelcome, this)
        },
        openPanelFloodScenario: function () {
            $('.panel-body-wrapper').not('.panel-flood-scenario').not('.floating-panel').hide();
            $('.panel-flood-scenario').show("slide", { direction: "right" }, 400);
        },
        backButtonAction: function (e) {
            $('form').trigger('reset');
            $('.default-disabled').prop('disabled', true);
            $(e.target).closest('.panel-body-subwrapper').hide();
            let $wrapper = $(e.target).closest('.panel-body-wrapper');
            $wrapper.hide("slide", { direction: "right" }, 300);
            $wrapper.prev().show("slide", { direction: "right" }, 400);
        },
        openUploadFloodForm: function (e) {
            $('.panel-body-wrapper').not('.panel-flood-form').not('.floating-panel').hide();
            let $wrapper = $('.panel-flood-form');
            $wrapper.show();
            $wrapper.find('.panel-upload-flood').show("slide", { direction: "right" }, 500);
        },
        openBrowseFlood: function (e) {
            $('.panel-browse-flood').show("slide", { direction: "right" }, 400);
        },
        hideBrowseFlood: function () {
            $('.panel-browse-flood').hide("slide", { direction: "right" }, 400);
        },
        fetchFloodById: function (e) {
            let flood_id = $(e.target).closest('.browse-arrow').attr('data-flood-id');
            dispatcher.trigger('flood:fetch-flood-by-id', flood_id);
        },
        openBrowseByForecast: function (e) {
            $(e.target).closest('.panel-body-wrapper').hide();
            let $wrapper = $('.panel-browse-by-forecast');
            $wrapper.show();
            $wrapper.parent().show("slide", { direction: "right" }, 400);
        },
        openBrowseByReturnPeriod: function (e) {
            $(e.target).closest('.panel-body-wrapper').hide();
            let $wrapper = $('.panel-browse-by-return-period');
            $wrapper.show();
            $wrapper.parent().show("slide", { direction: "right" }, 400);
        },
        clickPrevDate: function (e) {
            let $datepicker = $('.datepicker-browse');
            let datepicker_data = $datepicker.datepicker().data('datepicker');
            let date = datepicker_data.lastSelectedDate;

            let flood_dates = floodCollectionView.flood_dates;
            let beforedates = flood_dates.filter(function(d) {
                return d - date < 0;
            });

            beforedates.sort(function(a, b) {
                var distancea = Math.abs(date - a);
                var distanceb = Math.abs(date - b);
                return distancea - distanceb;
            });

            datepicker_data.selectDate(beforedates[0]);

            if(beforedates.length <= 1){
                $(e.target).closest('button').prop('disabled', true)
            }
        },
        clickNextDate: function (e) {
            let $datepicker = $('.datepicker-browse');
            let datepicker_data = $datepicker.datepicker().data('datepicker');
            let date = datepicker_data.lastSelectedDate;

            let flood_dates = floodCollectionView.flood_dates;
            let afterdates = flood_dates.filter(function(d) {
                return d - date > 0;
            });

            afterdates.sort(function(a, b) {
                var distancea = Math.abs(date - a);
                var distanceb = Math.abs(date - b);
                return distancea - distanceb;
            });

            datepicker_data.selectDate(afterdates[0]);

            if(afterdates.length <= 1){
                $(e.target).closest('button').prop('disabled', true)
            }
        },
        openDashboard: function () {
            this.dashboard = new DashboardView();
            $('.panel-body-wrapper').not('.floating-panel').hide();
            $('#panel-dashboard').show("slide", { direction: "right" }, 400);
        },
        openWelcome: function () {
            $('#panel-dashboard').hide();
            $('.panel-body-wrapper').not('.panel-welcome').not('.floating-panel').hide();
            $('.panel-welcome').show("slide", { direction: "right" }, 400);
        }
    })
});
