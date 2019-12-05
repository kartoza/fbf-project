define([
    'backbone',
    'moment'],
    function (Backbone, moment) {
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

        // add helper function for moment
        moment.fromAirDateTimePicker = function (value) {
            return moment(value, 'YYYY-MM-DD HH:mm');
        };

        moment.prototype.formatDate = function () {
            return this.format('YYYY-MM-DD');
        }

        moment.prototype.momentDateOnly = function () {
            return moment(this.formatDate());
        };

        moment.prototype.toJavascriptDate = function () {
            return new Date(...(this.toArray()));
        }
    })
