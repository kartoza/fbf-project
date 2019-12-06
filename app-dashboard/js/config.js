require.config({
    baseUrl: 'js/',
    paths: {
        'jquery': 'libs/jquery.js/3.4.1/jquery.min',
        'jqueryUi': 'libs/jquery-ui-1.12.1/jquery-ui.min',
        'backbone': 'libs/backbone.js/1.4.0/backbone-min',
        'leaflet': 'libs/leaflet/1.5.1/leaflet-src',
        'bootstrap': 'libs/bootstrap/3.3.5/js/bootstrap.min',
        'underscore': 'libs/underscore.js/1.9.1/underscore-min',
        'moment': 'libs/moment/2.24.0/moment.min',
        'rangeSlider': 'libs/ion-rangeslider/2.3.0/js/ion.rangeSlider.min',
        'leafletDraw': 'libs/leaflet.draw/1.0.4/leaflet.draw',
        'wellknown': 'libs/wellknown.js/0.5.0/wellknown',
        'airDatepicker': 'libs/airdatepicker/js/datepicker',
        'airDatepickerEN': 'libs/airdatepicker/js/i18n/datepicker.en',
        'chartjs': 'libs/chart/Chart-2.7.2',
        'markdown': 'libs/markdown-it-10.0.0/markdown-it.min'
    },
    shim: {
        moment: {
            exports: 'moment'
        },
        leaflet: {
            exports: 'L'
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
        },
        utils: {
            deps: ['moment'],
            exports: 'utils'
        }
    }
});
require([
    'jquery',
    'bootstrap',
    'backbone',
    'underscore',
    'moment',
    'leaflet',
    'leafletDraw',
    'airDatepicker',
    'airDatepickerEN',
    'utils',
    'js/view/map.js',
    'js/request.js',
    'js/view/flood-collection.js',
], function ($, bootstrap, Backbone, _, moment, L, LDraw, AirDatepicker, AirDatepickerEN,  utils, MAP, RequestView, FloodCollectionView) {
    AppRequest = new RequestView();
    dispatcher = _.extend({}, Backbone.Events);
    mapView = new MAP();
    floodCollectionView = new FloodCollectionView();
});
