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
            'click #btn-browse-return-period': 'openBrowseByReturnPeriod'
        },
        initialize: function () {
            let that = this;
            this.dashboard = new DashboardView();
            $('.add-flood-scenario').click(function () {
                that.openPanelFloodScenario()
            });

            $('.browse-floods').click(function () {
                dispatcher.trigger('intro:hide');
                that.openBrowseFlood()
            });

            // Initialize view
            this.flood_upload_view = new FloodUploadView();
            dispatcher.on('side-panel:open-dashboard', this.openDashboard, this);
            dispatcher.on('side-panel:open-welcome', this.openWelcome, this);
        },
        openPanelFloodScenario: function () {
            dispatcher.trigger('dashboard:hide');
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
        removeIntroWindow: function (e) {
            // Hide the intro window
            dispatcher.trigger('intro:hide');
        },
        openBrowseFlood: function (e) {
            $('.browse-btn-icon').hide();
            $('.panel-browse-flood').show("slide", { direction: "down" }, 400);
            $('.arrow-start').hide();
        },
        hideBrowseFlood: function () {
            $('.browse-btn-icon').show();
            $('.panel-browse-flood').hide("slide", { direction: "down" }, 400);
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
        openDashboard: function () {
            this.dashboard.render();
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
