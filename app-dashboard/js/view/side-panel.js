define([
    'backbone',
    'underscore',
    'jquery',
    'jqueryUi',
    'airDatepicker',
    'airDatepickerEN'
], function (Backbone, _, $, JqueryUi, AirDatepicker, AirDatepickerEN) {
    return Backbone.View.extend({
        el: "#side-panel",
        events: {
            'click .add-flood-scenario': 'openPanelFloodScenario',
            'click .btn-back': 'backButtonAction',
            // 'click #draw-flood': 'openDrawFloodForm',
            'click #upload-flood': 'openUploadFloodForm'
        },
        initialize: function () {
            let that = this;
            $('.add-flood-scenario').click(function () {
                that.openPanelFloodScenario()
            });

            $('.datepicker-form').datepicker({
                language: 'en',
                timepicker: true,
                autoClose: true
            })
        },
        openPanelFloodScenario: function () {
            $('.panel-body-wrapper').not('.panel-flood-scenario').hide();
            $('.panel-flood-scenario').show("slide", { direction: "right" }, 400);
        },
        backButtonAction: function (e) {
            $('form').trigger('reset');
            $('.default-disabled').prop('disabled', true);
            $(e.target).closest('.flood-form').hide();
            let $wrapper = $(e.target).closest('.panel-body-wrapper');
            $wrapper.hide("slide", { direction: "right" }, 300);
            $wrapper.prev().show("slide", { direction: "right" }, 400);
        },
        openDrawFloodForm: function (e) {
            $('.panel-body-wrapper').not('.panel-flood-form').hide();
            let $wrapper = $('.panel-flood-form');
            $wrapper.find('.panel-draw-flood').show();
            $wrapper.show("slide", { direction: "right" }, 500);
        },
        openUploadFloodForm: function (e) {
            $('.panel-body-wrapper').not('.panel-flood-form').hide();
            let $wrapper = $('.panel-flood-form');
            $wrapper.show();
            $wrapper.find('.panel-upload-flood').show("slide", { direction: "right" }, 500);
        }
    })
});