require.config({
    baseUrl: 'js/',
    paths: {
        'jquery': 'libs/jquery.js/3.4.1/jquery.min',
        'jqueryUi': 'libs/jquery-ui-1.12.1/jquery-ui.min',
        'backbone': 'libs/backbone.js/1.4.0/backbone-min',
        'leaflet': 'libs/leaflet/1.5.1/leaflet-src',
        'bootstrap': 'libs/bootstrap/3.3.5/js/bootstrap.min',
        'underscore': 'libs/underscore.js/1.9.1/underscore-min',
        'rangeSlider': 'libs/ion-rangeslider/2.3.0/js/ion.rangeSlider.min',
        'leafletDraw': 'libs/leaflet.draw/1.0.4/leaflet.draw',
        'wellknown': 'libs/wellknown.js/0.5.0/wellknown',
        'airDatepicker': 'libs/airdatepicker/js/datepicker',
        'airDatepickerEN': 'libs/airdatepicker/js/i18n/datepicker.en'
    },
    shim: {
        leaflet: {
            exports: ['L']
        },
        bootstrap: {
            deps: ["jquery"]
        },
        rangeSlider: {
            deps: ["jquery"]
        },
        leafletDraw: {
            deps: ['leaflet'],
            exports: 'LeafletDraw'
        },
        airDatepicker: {
            deps: ['jquery', 'jqueryUi', 'bootstrap']
        },
        airDatepickerEN: {
            deps: ['jquery', 'jqueryUi', 'bootstrap', 'airDatepicker']
        }
    }
});
require([
    'jquery',
    'bootstrap',
    'backbone',
    'underscore',
    'leaflet',
    'leafletDraw',
    'js/view/map.js',
    'js/request.js',
    'airDatepicker',
    'airDatepickerEN',
    'js/view/flood-collection.js',
], function ($, bootstrap, Backbone, _, L, LDraw, MAP, RequestView, AirDatepicker, AirDatepickerEN, FloodCollectionView) {
    AppRequest = new RequestView();
    dispatcher = _.extend({}, Backbone.Events);
    mapView = new MAP();
    floodCollectionView = new FloodCollectionView();
});
