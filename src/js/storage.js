var Storage = function() {

	var save = function(object, objectName) {

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
}();


// var testObject = { 'one': 1, 'two': 2, 'three': 3 };

// // Put the object into storage
// localStorage.setItem('testObject', JSON.stringify(testObject));

// // Retrieve the object from storage
// var retrievedObject = localStorage.getItem('testObject');

// console.log('retrievedObject: ', JSON.parse(retrievedObject));



// OR



// Storage.prototype.setObject = function(key, value) {
//     this.setItem(key, JSON.stringify(value));
// }

// Storage.prototype.getObject = function(key) {
//     var value = this.getItem(key);
//     return value && JSON.parse(value);
// }


