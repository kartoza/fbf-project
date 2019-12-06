var dispatcher;
var geoserverUrl = 'http://78.47.62.69/geoserver/wms';
var gwcURL = 'http://78.47.62.69/geoserver/gwc/service/wms';
var postgresUrl = 'http://159.69.44.205:3000/';
// for appending Location url
var postgresBaseUrl = 'http://159.69.44.205:3000'
var mapView;
var AppRequest;
var floodCollectionView;

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.capitalize = function () {
    var target = this;
    return target.charAt(0).toUpperCase() + target.slice(1);
};

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];