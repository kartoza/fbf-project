define([
    'moment'],
    function (moment) {
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
    })
