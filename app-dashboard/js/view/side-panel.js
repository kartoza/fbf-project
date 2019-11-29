define([
    'backbone',
    'underscore',
    'jquery',
    'jqueryUi',
    'js/view/layers/upload-flood.js'
], function (Backbone, _, $, JqueryUi, FloodUploadView) {
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
            this.flood_upload_view = new FloodUploadView()
        },
        openPanelFloodScenario: function () {
            $('.panel-body-wrapper').not('.panel-flood-scenario').hide();
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
            $('.panel-body-wrapper').not('.panel-flood-form').hide();
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
        clickPrevDate: function () {
            let $datepicker = $('.datepicker-browse');
            let datepicker_data = $datepicker.datepicker().data('datepicker');
            let date = datepicker_data.date;
            date.setDate(date.getDate() - 1);
            datepicker_data.selectDate(date);
        },
        clickNextDate: function () {
            let $datepicker = $('.datepicker-browse');
            let datepicker_data = $datepicker.datepicker().data('datepicker');
            let date = datepicker_data.date;
            date.setDate(date.getDate() + 1);
            datepicker_data.selectDate(date);
        }
    })
});
