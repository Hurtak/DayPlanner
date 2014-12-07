/*exported Lib */

var Lib = (function() {
  "use strict";

  var isNumber = function(n) {
    return (Object.prototype.toString.call(n) === "[object Number]" || Object.prototype.toString.call(n) === "[object String]") &&!isNaN(parseFloat(n)) && isFinite(n.toString().replace(/^-/, ""));
  };

  /**
   * Converts number from one range to number scaled accoringly to another range
   * eg. 50 from range <0;100> converts to 0 of range <-100;100>
   * @param  [number] [number] [number you want to convers]
   * @param  [number] [oldMin] [old range minimum]
   * @param  [number] [oldMax] [old range maximum]
   * @param  [number] [newMin] [new range minimum]
   * @param  [number] [newMax] [new range maximum]
   * @return [number]          [converted number]
   */
  var linearConversion = function(number, oldMin, oldMax, newMin, newMax) {
    var newValue;
    var oldRange = oldMax - oldMin;

    if (oldRange === 0) {
      newValue = newMax;
    } else {
      var newRange = newMax - newMin;
      newValue = (((number - oldMin) * newRange) / oldRange) + newMin;
    }

    return newValue;
  };

  var getDocumentHeight = function() {
    var body = document.body;
    var html = document.documentElement;

    var height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    return height;
  };

  return {
    isNumber: isNumber,
    linearConversion: linearConversion,
    getDocumentHeight: getDocumentHeight
  };

}());
