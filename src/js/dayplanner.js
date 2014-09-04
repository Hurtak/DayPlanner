var DayPlanner = function() {
	var menu;

	var minOpenedItemHeight = 100; // px
	var maxOpenedItemHeight = 300; // px

	var minItemInterval = 1; // min
	var maxItemInterval = 120; // min

	var startTime = "00:00";

	/********
	 * MAIN *
	 ********/

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
		return getMenu().parentNode;
	};

	var getItemDuration = function(item) {
		return item.querySelector(".duration").innerHTML.trim() * 1;
	};

	var getItemName = function(item) {
		return item.querySelector(".item-name").innerHTML.trim();
	};

	var calculateTimes = function() {
		var items = document.querySelectorAll('.item');

		var previousTime = startTime;
		for (var i = 0; i < items.length; i++) {
			items[i].querySelector(".time").innerHTML = Time.minutesToTime(Time.timeToMinutes(previousTime) + getItemDuration(items[i]));
			previousTime = Time.minutesToTime(getItemDuration(items[i]) + Time.timeToMinutes(previousTime));		
		}
	};

	var openItem = function(item) {
		resetItemsHeight();
		showMenu(item);
		resizeOpenedItem(item.querySelector(".duration").innerHTML);
	};

	var resizeOpenedItem = function(minutes) {
		minutes = minutes * 1;
		minutes = Lib.linearConversion(minutes, minItemInterval, maxItemInterval, minOpenedItemHeight, maxOpenedItemHeight);
		resizeItem(getOpenedItem(), minutes);
	};

	/********
	 * MENU *
	 ********/

	var getMenu = function() {
		return document.getElementById("menu");
	};

	var showMenu = function(item) {
		item.appendChild(getMenu());
		refreshMenu();
	};

	var hideMenu = function() {
		document.getElementById("hide").appendChild(getMenu());
	};

	var refreshMenu = function() {
		var openedItem = getOpenedItem();

		// refresh change item name input
		document.getElementById("name-input").value = getItemName(openedItem);
		// refresh duration input
		document.getElementById("duration-input").value = getItemDuration(openedItem);
	};

	/********
	 * INIT *
	 ********/

	var init = function() {
		// initialize first time in items start/end times 
		document.getElementById('start-time').innerHTML = startTime;

		var items = document.querySelectorAll('.content');
		// items init
		for (var i = 0; i < items.length; i++) {
			// add onclick to display options
			items[i].onclick = function() {
				openItem(this.parentNode);
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
				openItem(this.parentNode);
			};

			// opens menu on newly created item
			openItem(newItem);
			// recalculate times
			calculateTimes();
		};
	
		// delete button init
		var deleteButton = document.getElementById("delete-item");
		deleteButton.onclick = function() {
			var openedItem = getOpenedItem();

			hideMenu();
			
			// delete current item
			openedItem.outerHTML = "";

			// recalculate times
			calculateTimes();
		};

		// duration buttons
		var addDuration = function(amount) {
			var durationInput = document.getElementById("duration-input");

			amount = amount * 1 + durationInput.value * 1;
			if (amount < minItemInterval) {
				amount = minItemInterval;
			} else if (amount > maxItemInterval) {
				amount = maxItemInterval;
			}

			getOpenedItem().querySelector(".duration").innerHTML = amount;
			durationInput.value = amount;
			
			resizeOpenedItem(amount);
			calculateTimes();
		};

		var changeDuration = function(amount) {
			if (Lib.isNumber(amount) && amount >= minItemInterval && amount <= maxItemInterval) {
				getOpenedItem().querySelector(".duration").innerHTML = Math.round(amount);
				resizeOpenedItem(amount);
				calculateTimes();
			}
		};

		var durationInput = document.getElementById("duration-input");
		durationInput.oninput = function() {
			// It's not quite magic to make onchange fire on all those actions.  <input onchange="doSomething();" onkeypress="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"> will do well enough for most
			changeDuration(this.value);
		};

		var plusButton = document.getElementById("duration-plus");
		plusButton.onclick = function() {
			addDuration(10);
		};

		var minusButton = document.getElementById("duration-minus");
		minusButton.onclick = function() {
			addDuration(-10);
		};

		// changes name of item
		var nameInput = document.getElementById("name-input");
		nameInput.oninput = function() {
			getOpenedItem().querySelector(".item-name").innerHTML = nameInput.value;
		};

		//hide menu button
		var hideMenuButton = document.getElementById("hide-menu");
		hideMenuButton.onclick = function() {
			resetItemsHeight();
			hideMenu();
		};

		// color settings
		var colors = document.getElementById("colors").getElementsByTagName("div");
		for (var i = 0; i < colors.length; i++) {
			colors[i].onclick = function() {
				getOpenedItem().style.backgroundColor = this.style.backgroundColor;
			};
		}
	};

	return {
		init: init
	};
}();
