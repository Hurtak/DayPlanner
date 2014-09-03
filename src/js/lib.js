var Lib = function() {

	function isNumber(n) {
		return (Object.prototype.toString.call(n) === '[object Number]' || Object.prototype.toString.call(n) === '[object String]') &&!isNaN(parseFloat(n)) && isFinite(n.toString().replace(/^-/, ''));
	}

	return {
		isNumber: isNumber
	};
}();