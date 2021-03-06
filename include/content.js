/*
    Copyright (C) 2015  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var util = require('./util.js');

module.exports = function(pb) {

    /**
     * Service for content settings retrieval
     *
     * @module Services
     * @class ContentService
     * @constructor
     */
    function ContentService(){}
    
    /**
     *
     * @private
     * @static
     * @readonly
     * @property CONTENT_SETTINGS_REF
     * @type {String}
     */
    var CONTENT_SETTINGS_REF = 'content_settings';
    
    /**
     *
     * @private
     * @static
     * @readonly
     * @property DEFAULT_SETTINGS
     * @type {String}
     */
    var DEFAULT_SETTINGS = Object.freeze({
        articles_per_page: 5,
        auto_break_articles: 0,
        read_more_text: 'Read more',
        display_timestamp: 1,
        date_format: 'M dd, YYYY',
        two_digit_date: 0,
        display_hours_minutes: 1,
        time_format: '12',
        two_digit_time: 0,
        display_bylines: 1,
        display_author_photo: 1,
        display_author_position: 1,
        allow_comments: 1,
        default_comments: 1,
        require_account: 0,
        require_verification: 0
    });

    /**
     * A long named alias of 'get'
     * @method getSettings
     * @param {Function} cb Callback function
     */
    ContentService.prototype.getSettings = function(cb){
        this.get(cb);
    };
    
    /**
     * Retrieves the content settings.  When settings are not found in storage 
     * the service will generate defaults and persist them.
     * @method get
     * @param {Function} cb Callback function
     */
    ContentService.prototype.get = function(cb) {
        pb.settings.get(CONTENT_SETTINGS_REF, function(err, settings){
            if (settings) {
                return cb(err, settings);
            }

            //set default settings if they don't exist
            settings = ContentService.getDefaultSettings();
            pb.settings.set(CONTENT_SETTINGS_REF, settings, function(err, result) {
                cb(err, settings);
            });
        });
    };

    /**
     * Retrieves the default content settings from installation
     *
     * @method getDefaultSettings
     * @return {Object} Content settings
     */
    ContentService.getDefaultSettings = function() {
        return util.clone(DEFAULT_SETTINGS);
    };

    /**
     * Returns a formatted time stamp from a date
     *
     * @method getTimestampTextFromSettings
     * @param {Date} date
     * @param {Object} contentSettings
     */
    ContentService.getTimestampTextFromSettings = function(date, contentSettings, ls) {
        var options = {
            date: date,
            format: contentSettings.date_format,
            twoDigitDate: contentSettings.two_digit_date,
            displayTime: contentSettings.display_hours_minutes,
            timeFormat: contentSettings.time_format,
            twoDigitTime: contentSettings.two_digit_time,
            ls: ls
        };
        return ContentService.getTimestampText(options);
    };

    /**
     * 
     * @static
     * @method getTimestampText
     * @param {Object} options
     * @param {Date} options.date
     * @param {String} options.format
     * @param {Boolean} options.twoDigitDate
     * @param {Boolean} options.displayTime
     * @param {String} options.timeFormat
     * @param {Boolean} options.twoDigitTime
     * @param {Localization} options.ls
     */
    ContentService.getTimestampText = function(options) {
        var date         = options.date;
        var format       = options.format;
        var twoDigitDate = options.twoDigitDate;
        var displayTime  = options.displayTime;
        var timeFormat   = options.timeFormat;
        var twoDigitTime = options.twoDigitTime;
        var ls           = options.ls;
        if (!ls) {
            ls = new pb.Localization();
        }

        var dateString = format;
        var monthNames = [
          ls.get('JAN'),
          ls.get('FEB'),
          ls.get('MAR'),
          ls.get('APR'),
          ls.get('MAY'),
          ls.get('JUN'),
          ls.get('JUL'),
          ls.get('AUG'),
          ls.get('SEP'),
          ls.get('OCT'),
          ls.get('NOV'),
          ls.get('DEC')
        ];

        var month = date.getMonth() + 1;
        var day   = date.getDate();

        month = (twoDigitDate && month < 10) ? '0' + month : month.toString();
        day   = (twoDigitDate && day < 10) ? '0' + day : day.toString();

        dateString = dateString.split('YYYY').join(date.getFullYear());
        dateString = dateString.split('yy').join(date.getYear());
        dateString = dateString.split('M').join(monthNames[date.getMonth()]);
        dateString = dateString.split('mm').join(month);
        dateString = dateString.split('dd').join(day);

        if (typeof displayTime !== 'undefined' && displayTime) {

            var hours   = date.getHours();
            var minutes = date.getMinutes();
            if(minutes < 10) {
                minutes = '0' + minutes;
            }
            var ampm = '';

            if(timeFormat == '12') {
                if(hours > 12) {
                    hours -= 12;
                    ampm = ' '+ls.get('TIME_PM');
                }
                else {
                    ampm = ' '+ls.get('TIME_AM');
                }
            }
            if(twoDigitTime && hours < 10) {
                hours = '0' + hours;
            }

            dateString = dateString.concat(' ' + hours + ':' + minutes + ampm);
        }
        return dateString;
    };

    //exports
    return ContentService;
};
