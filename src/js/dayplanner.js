var DayPlanner = function() {
	var items, menu;

	var openedItemHeight = 200; // px
	var openedItem;

	var startTime = "00:00";

	// set height according to duration (1 minute = 1px)
	var resetHeight = function(item) {
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

		// initialize first time in items start/end times 
		document.getElementById('start-time').innerHTML = startTime;

		// items init
		for (var i = 0; i < items.length; i++) {
			// set height according to duration (1 minute = 1px)
			resetHeight(items[i]);

			// add onclick to display options
			items[i].onclick = function() {
				clickOnItem(this);
			};
		}

		// calculates start/end times of items
		calculateTimes(items, startTime);

		//initialize menu
		menuInit();
	};

	var menuInit = function() {
		// add button init
		var addButton = document.getElementById("add-item");
		addButton.onclick = function() {
			// add default item behind selected item
			var defaultItem = document.getElementById("default-item").children[0];
			defaultItem = defaultItem.cloneNode(true);

			var itemNode = this.parentNode.parentNode;
			var newItem = itemNode.parentNode.insertBefore(defaultItem, itemNode.nextSibling);

			// add onclick event
			newItem.onclick = function() {
				clickOnItem(this);
			};
			
			// opens menu on newly created item
			openItem(newItem);

			// recalculate times
			calculateTimes(document.querySelectorAll('.item'), startTime);
		};

		
		// delete button init
		var deleteButton = document.getElementById("delete-item");
		deleteButton.onclick = function() {
			// add default item behind selected item
			var selectedItem = this.parentNode.parentNode;
			selectedItem.outerHTML = "";

			// recalculate times
			calculateTimes(document.querySelectorAll('.item'), startTime);
		};

		// duration buttons
		var durationInput = document.getElementById("duration");
		var plusButton = document.getElementById("duration-plus");
		plusButton.onclick = function() {
			this.value = this.value * 1 + 10;
		};
		var minusButton = document.getElementById("duration-minus");
		minusButton.onclick = function() {
			this.value = this.value * 1 - 10;
		};		

		//hide menu button
		var hideMenuButton = document.getElementById("hide-menu");
		hideMenuButton.onclick = function() {
			var item = this.parentNode.parentNode;

			resetHeight(item);
			hideMenu(item);
			alert(1);
		};	
	};


	var clickOnItem = function(item) {
		// click folded on item
		if (item.getAttribute("data-duration") === item.style.height.slice(0, - 2)) {
			item.style.height = openedItemHeight + "px";
			if (openedItem && openedItem !== item) {
				resetHeight(openedItem);
			}
			openedItem = item;

			showMenu(item);
		// click different item, or the same opened item
		} else {
			resetHeight(item);
			hideMenu(item);
		}
	};

	var openItem = function(item) {
		item.style.height = openedItemHeight + "px";
		openedItem = item;
		showMenu(item);		
	};

	return {
		init: init
	};
}();
