var DayPlanner = function() {
	var items, menu;

	var openedItemHeight = 200; // px
	var openedItem;

	var closeItem = function(el) {
		el.style.height = el.getAttribute("data-duration") + "px";
	};

	var showMenu = function(item) {
		item.appendChild(menu);
		menu.style.display = "block";
	};

	var hideMenu = function(item) {
		item.removeChild(menu);
	};

	var init = function() {
		items = document.querySelectorAll('.item');
		menu = document.getElementById('menu');

		for (var i = 0; i < items.length; i++) {
			// set height according to duration (1 minute = 1px)
			items[i].style.height = items[i].getAttribute("data-duration") + "px";

			// add onclick to display options
			items[i].onclick = function() {
				openItem(this);
			};
		}
	};

	var openItem = function(el) {
		// click folded on item
		if (el.getAttribute("data-duration") === el.style.height.slice(0, - 2)) {
			el.style.height = openedItemHeight + "px";
			if (openedItem && openedItem !== el) {
				closeItem(openedItem);
			}
			openedItem = el;

			showMenu(el);
		// click different item, or the same opened item
		} else {
			el.style.height = el.getAttribute("data-duration") + "px";
			hideMenu(el);
		}
	};

	return {
		init: init
	};
}();
