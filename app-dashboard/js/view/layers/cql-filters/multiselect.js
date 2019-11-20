define([
    'backbone',
    'underscore',
    'js/view/layers/cql-filters/base.js'], function (Backbone, _, Base) {
    return Base.extend({
        selected: [],
        templateID: '-filter-multiselect',
        initEvent: function () {
            /** Initiate all event listener **/
            let that = this;
            this.$el.find('input').each(function (index) {
                $(this).change(function () {
                    dispatcher.trigger('layer-' + that.layerID + ':refresh');
                });
            });
        },
        cqlFilter: function () {
            /** Get cql filters that selected **/
            let selected = [];
            if (this.$el.find('input:checkbox:not(:checked)').length === 0) {
                return null;
            }

            this.$el.find('input:checkbox:checked').each(function (index) {
                selected.push("'" + $(this).val() + "'");
            });
            if (selected.length > 0) {
                return this.filterName + " IN (" + selected.join(',') + ")"
            } else {
                return this.filterName + " IN (-99)";
            }
        }
    });
});