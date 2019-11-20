define([
    'backbone',
    'underscore',
    'rangeSlider',
    'js/view/layers/cql-filters/base.js'], function (Backbone, _, rangeSlider, Base) {
    return Base.extend({
        selected: 1,
        templateID: '-filter-multiselect',
        render: function () {
            /** Render filters into dom **/
            let that = this;
            this.$el = $('#' + this.elementID)
            this.selected = this.options['from'];
            this.options['onChange'] = (data) => {
                that.selected = data['from'];
                dispatcher.trigger('layer-' + that.layerID + ':refresh');
                dispatcher.trigger(that.databaseModel + ':update-stats');
            };
            this.$el.ionRangeSlider(
                this.options);
        },
        cqlFilter: function () {
            /** Get cql filters of selection **/
            if (this.selected === 0) {
                return null;
            } else {
                return this.filterName + ">=" + this.selected;
            }
        },
        postgrestFilter: function () {
            /** Get postgrest filters of selection**/
            if (this.selected === 0) {
                return null;
            } else {
                return this.filterName + '=gte.' + this.selected;
            }
        }
    });
});