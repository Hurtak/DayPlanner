var DayPlanner = function() {

	var init = function() {
		var x = document.querySelectorAll('.item');
		console.log(x);

		for (var i = 0; i < x.length; i++) {
			// set height according to duration (1 minute = 1px)
			x[i].style.height = x[i].getAttribute("data-duration") + "px";
		console.log(x[i].style.height.slice(0, - 2));

			x[i].onclick = 	function() {
				if (this.getAttribute("data-duration") === this.style.height.slice(0, - 2)) {
					this.style.height = 200 + "px";
				} else {
					this.style.height = this.getAttribute("data-duration") + "px";
				}
			};
		}
	};

	return {
		init: init
	};
}();
