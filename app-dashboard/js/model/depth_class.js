define([
    'backbone'],
    /**
     * attributes:
     * - id
     * - label
     * - max_m
     * - min_m
     */
    function (Backbone) {
    return Backbone.Model.extend({
        urlRoot: postgresUrl + 'depth_class',

        url: function(){
            return `${this.urlRoot}?id=eq.${this.get('id')}`;
        }
    })
})
