var DayPlanner = function() {
	var menu;

	var openedItemHeight = 200; // px
	var minItemInterval = 5; // min

	var startTime = "00:00";

	// set height according to duration (1 minute = 1px)
	var resetItemsHeight = function() {
		var items = document.querySelectorAll('.item');
		for (var i = 0; i < items.length; i++) {
			resizeItem(items[i], getItemDuration(items[i]));
		}
	};

	var resizeItem = function(item, height) {
		item.style.height = height + "px";
	};

	var getOpenedItem = function() {
		return document.getElementById("menu").parentNode;
	};

	var showMenu = function(item) {
		item.appendChild(menu);
		menu.style.display = "block";

		refreshMenu();
	};

	var refreshMenu = function() {
		var openedItem = getOpenedItem();

		// refresh change item name input
		document.getElementById("name-input").value = getItemName(openedItem);
	
		// refresh duration input
		document.getElementById("duration-input").value = getItemDuration(openedItem);
	};

	var getItemDuration = function(item) {
		return item.querySelector(".duration").innerHTML.trim() * 1;
	};

	var getItemName = function(item) {
		return item.querySelector(".item-name").innerHTML.trim();
	};

	var hideMenu = function() {
		document.getElementById("menu").outerHTML = "";
	};

	var calculateTimes = function() {
		var items = document.querySelectorAll('.item');

		var previousTime = startTime;
		for (var i = 0; i < items.length; i++) {
			items[i].querySelector(".time").innerHTML = Time.minutesToTime(Time.timeToMinutes(previousTime) + getItemDuration(items[i]));
			previousTime = Time.minutesToTime(getItemDuration(items[i]) + Time.timeToMinutes(previousTime));		
		}
	};

	var init = function() {
		// initialize first time in items start/end times 
		document.getElementById('start-time').innerHTML = startTime;

		var items = document.querySelectorAll('.content');
		// items init
		for (var i = 0; i < items.length; i++) {
			// add onclick to display options
			items[i].onclick = function() {
				clickOnItem(this.parentNode);
			};
		}

		// set height according to duration (1 minute = 1px)
		resetItemsHeight();

		// calculates start/end times of items
		calculateTimes();

		//initialize menu
		menuInit();
	};

	var menuInit = function() {
		menu = document.getElementById('menu');

		// add button init
		var addButton = document.getElementById("add-item");
		addButton.onclick = function() {
			// add default item behind selected item
			var defaultItem = document.getElementById("default-item").children[0];
			defaultItem = defaultItem.cloneNode(true);

			var itemNode = getOpenedItem();
			var newItem = itemNode.parentNode.insertBefore(defaultItem, itemNode.nextSibling);

			// add onclick event on newly created item
			newItem.querySelector(".content").onclick = function() {
				clickOnItem(this.parentNode);
			};

			// opens menu on newly created item
			clickOnItem(newItem);
			// recalculate times
			calculateTimes();
		};
	
		// delete button init
		var deleteButton = document.getElementById("delete-item");
		deleteButton.onclick = function() {
			// delete current item
			getOpenedItem().outerHTML = "";

			// recalculate times
			calculateTimes();
		};

		// duration buttons
		var durationInput = document.getElementById("duration-input");
		var changeDurationInput = function(amount) {
			if (Lib.isNumber(durationInput.value)) {
				durationInput.value = durationInput.value * 1 + amount;
			} else {
				durationInput.value = getItemDuration(getOpenedItem());
			}
		};

		var plusButton = document.getElementById("duration-plus");
		plusButton.onclick = function() {
			changeDurationInput(10);
		};

		var minusButton = document.getElementById("duration-minus");
		minusButton.onclick = function() {
			changeDurationInput(-10);
		};

		//hide menu button
		var hideMenuButton = document.getElementById("hide-menu");
		hideMenuButton.onclick = function() {
			resetItemsHeight();
			hideMenu();
		};

		// save button
		var saveButton = document.getElementById("save");
		saveButton.onclick = function() {
			// resizes item height according to input value
			if (Lib.isNumber(durationInput.value) && durationInput.value >= minItemInterval) {
				getOpenedItem().querySelector(".duration").innerHTML = durationInput.value;
			}

			// changes name of item
			var nameInput = document.getElementById("name-input");
			getOpenedItem().querySelector(".item-name").innerHTML = nameInput.value;

			hideMenu();
			resetItemsHeight();
			calculateTimes();
		};
	};

	var clickOnItem = function(item) {
		resetItemsHeight();
		resizeItem(item, openedItemHeight);
		showMenu(item);
	};

	return {
		init: init
	};
}();
