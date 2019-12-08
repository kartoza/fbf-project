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
    const DepthClass = Backbone.Model.extend({
        urlRoot: postgresUrl + 'depth_class',

        url: function(){
            return `${this.urlRoot}?id=eq.${this.id}`;
        }
    });

    return Backbone.Collection.extend({
        model: DepthClass,
        urlRoot: postgresUrl + 'depth_class',
        url: function () {
            return this.urlRoot
        }
    });
})
