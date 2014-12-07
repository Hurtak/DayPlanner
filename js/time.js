/*exported Time */

var Time = (function() {
  "use strict";

  var addLeadingZeros = function(number) {
    while (number.length < 2) {
      number = "0" + number;
    }
    return number;
  };

  // converts "95" minutes to "01:35"
  var minutesToTime = function(minutes) {
    var hours = Math.floor(minutes / 60 % 24).toString();
    minutes = (Math.round(minutes % 60)).toString();

    minutes = addLeadingZeros(minutes);
    hours = addLeadingZeros(hours);

    return hours + ":" + minutes;
  };

  // converts "01:35" minutes to "95"
  var timeToMinutes = function(time) {
    time = time.split(":");

    return time[0] * 60 + time[1] * 1;
  };

  return {
    timeToMinutes: timeToMinutes,
    minutesToTime: minutesToTime
  };

}());
