/*exported Storage */

var Storage = (function() {
  "use strict";

  var save = function(objectName, object) {
    object = JSON.stringify(object);
    localStorage.setItem(objectName, object);
  };

  var load = function(objectName) {
    var object = localStorage.getItem(objectName);
    object = JSON.parse(object);

    return object;
  };

  return {
    save: save,
    load: load
  };

}());
