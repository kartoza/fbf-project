define([
    'backbone',
    'underscore',
    'jquery'], function (Backbone, _, $) {

    // override Backbone fetch to use postgREST standard
    // Accept header 'application/vnd.pgrst.object+json' needs to be sent
    // In order for the request to return a single object
    const _prev_fetch = Backbone.Model.prototype.fetch
    Backbone.Model.prototype.fetch = function (options) {
        options = _.extend({
            headers: {
                Accept: 'application/vnd.pgrst.object+json'
            }
        });
        console.log(options);
        return _prev_fetch.apply(this, [options])
    }

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
        post: function (url, data, successCallback, errorCallback, contentType) {
            /** GET Request that receive url and handle callback **/
            if(contentType === 'application/json'){
                data = JSON.stringify(data)
            }
            return $.ajax({
                url: url,
                data: data,
                contentType: contentType || 'application/x-www-form-urlencoded; charset=UTF-8',
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

