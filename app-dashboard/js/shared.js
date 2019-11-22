var dispatcher;
var geoserverUrl = 'http://78.47.62.69/geoserver/wms';
var gwcURL = 'http://78.47.62.69/geoserver/gwc/service/wms';
var postgresUrl = 'http://78.47.62.69:3000/';
var mapView;
var AppRequest;

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
}

String.prototype.capitalize = function () {
    var target = this;
    return target.charAt(0).toUpperCase() + target.slice(1);
}