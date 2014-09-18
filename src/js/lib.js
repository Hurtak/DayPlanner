var Lib = function() {

	var isNumber = function(n) {
		return (Object.prototype.toString.call(n) === '[object Number]' || Object.prototype.toString.call(n) === '[object String]') &&!isNaN(parseFloat(n)) && isFinite(n.toString().replace(/^-/, ''));
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

	/**
	 * @param [string]  [styleName] [filename with suffix "style.css"]
	 * @param [boolean] [disabled]  [true disables style]
	 */
	var disableStyle = function(styleName, disabled) {
		var styles = document.styleSheets;
		var href = "";
		for (var i = 0; i < styles.length; i++) {
			href = styles[i].href.split("/");
			href = href[href.length - 1];

			if (href === styleName) {
				styles[i].disabled = disabled;
				break;
			}
		}
	};

	return {
		isNumber: isNumber,
		linearConversion: linearConversion,
		disableStyle: disableStyle
	};
}();