define([
    'backbone',
    'jquery'], function (Backbone, $) {
    return Backbone.View.extend({
        get: function (url, parameters, headers, successCallback, errorCallback) {
            /** GET Request that receive url and handle callback **/
            return $.ajax({
                url: url,
                data: parameters,
                dataType: 'json',
                beforeSend: function (xhrObj) {
                    if (headers) {
                        $.each(headers, function (key, value) {
                            xhrObj.setRequestHeader(key, value);
                        });
                    }
                },
                success: function (data, textStatus, request) {
                    if (successCallback) {
                        successCallback(data, textStatus, request);
                    }
                },
                error: function (error, textStatus, request) {
                    if (errorCallback) {
                        errorCallback(error, textStatus, request)
                    }
                }
            });
        },
        post: function (url, data, successCallback, errorCallback) {
            /** GET Request that receive url and handle callback **/
            return $.ajax({
                url: url,
                data: data,
                dataType: 'json',
                type: 'POST',
                success: function (data, textStatus, request) {
                    if (successCallback) {
                        successCallback(data, textStatus, request);
                    }
                },
                error: function (error, textStatus, request) {
                    if (errorCallback) {
                        errorCallback(error, textStatus, request)
                    }
                }
            });
        },
        delete: function (url, parameters, successCallback, errorCallback) {
            /** GET Request that receive url and handle callback **/
            return $.ajax({
                url: url,
                data: parameters,
                dataType: 'json',
                type: 'DELETE',
                success: function (data, textStatus, request) {
                    if (successCallback) {
                        successCallback(data, textStatus, request);
                    }
                },
                error: function (error, textStatus, request) {
                    if (errorCallback) {
                        errorCallback(error, textStatus, request)
                    }
                }
            });
        }
    })
});

