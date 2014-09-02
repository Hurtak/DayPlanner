var DayPlanner = function() {
	var items, menu;

	var openedItemHeight = 200; // px
	var openedItem;

	var startTime = "00:00";

	var closeItem = function(item) {
		item.style.height = item.getAttribute("data-duration") + "px";
	};

	var showMenu = function(item) {
		item.appendChild(menu);
		menu.style.display = "block";

		// refresh duration input
		document.getElementById("duration").value = item.getAttribute("data-duration");
	};

	var hideMenu = function(item) {
		item.removeChild(menu);
	};

	var calculateTimes = function(items, startTime) {
		var previousTime = startTime;

		for (var i = 0; i < items.length; i++) {
			items[i].querySelector(".time").innerHTML = Time.minutesToTime(Time.timeToMinutes(previousTime) + items[i].getAttribute("data-duration") * 1);
			previousTime = Time.minutesToTime(items[i].getAttribute("data-duration") * 1 + Time.timeToMinutes(previousTime));		
		}
	};

	var init = function() {
		items = document.querySelectorAll('.item');
		menu = document.getElementById('menu');

		document.getElementById('start-time').innerHTML =  startTime;

		// items init
		for (var i = 0; i < items.length; i++) {
			// set height according to duration (1 minute = 1px)
			items[i].style.height = items[i].getAttribute("data-duration") + "px";

			// add onclick to display options
			items[i].onclick = function() {
				openItem(this);
			};

		}
		// calculates times
		calculateTimes(items, startTime);

		// add button init
		var addButton = document.getElementById("add-item");
		addButton.onclick = function() {
			// add default item behind selected item
			var defaultItem = document.getElementById("default-item").children[0];
			defaultItem = defaultItem.cloneNode(true);

			var itemNode = addButton.parentNode.parentNode;
			var newItem = itemNode.parentNode.insertBefore(defaultItem, itemNode.nextSibling);

			// add onclick event
			newItem.onclick = function() {
				openItem(this);
			};
			
			// recalculate times
			calculateTimes(document.querySelectorAll('.item'), startTime);
		};

		// delete button init
		var deleteButton = document.getElementById("delete-item");
		deleteButton.onclick = function() {
			// add default item behind selected item
			var selectedItem = deleteButton.parentNode.parentNode;
			selectedItem.outerHTML = "";

			// recalculate times
			calculateTimes(document.querySelectorAll('.item'), startTime);
		};

		// duration buttons
		var durationInput = document.getElementById("duration");
		var plusButton = document.getElementById("duration-plus");
		plusButton.onclick = function() {
			durationInput.value = durationInput.value * 1 + 10;
		};
		var minusButton = document.getElementById("duration-minus");
		minusButton.onclick = function() {
			durationInput.value = durationInput.value * 1 - 10;
		};		

		//hide menu button
		
	};

	var openItem = function(item) {
		// click folded on item
		if (item.getAttribute("data-duration") === item.style.height.slice(0, - 2)) {
			item.style.height = openedItemHeight + "px";
			if (openedItem && openedItem !== item) {
				closeItem(openedItem);
			}
			openedItem = item;

			showMenu(item);
		// click different item, or the same opened item
		} else {
			// item.style.height = item.getAttribute("data-duration") + "px";
			// hideMenu(item);
		}
	};

	return {
		init: init
	};
}();
