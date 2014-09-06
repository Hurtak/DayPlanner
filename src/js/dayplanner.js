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
		var items = getItems();
		for (var i = 0; i < items.length; i++) {
			setItemHeight(items[i], getItemDuration(items[i]));
		}
	};

	var recalculateTimes = function() {
		var items = getItems();

		var previousTime = startTime;
		for (var i = 1; i < items.length; i++) {
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
		setItemHeight(getOpenedItem(), Math.round(minutes));
	};

	var hide = function(element) {
		document.getElementById("hide").appendChild(element);
	};

		/*****************
		 * GET FUNCTIONS *
		 *****************/	

		var getOpenedItem = function() {
			return getMenu().parentNode;
		};

		var getItemsContainer = function() {
			return document.getElementById("items-container");
		};	
		var getItems = function() {
			return getItemsContainer().querySelectorAll(".item");
		};

		var getItemName = function(item) {
			return item.querySelector(".item-name").innerHTML.trim();
		};
		var getItemDuration = function(item) {
			return item.querySelector(".duration").innerHTML.trim() * 1;
		};
		var getItemColor = function(item) {
			return item.style.backgroundColor;
		};

		var getDefaultItemClone = function() {
			var defaultItem = document.getElementById("default-item").children[0];
			defaultItem = defaultItem.cloneNode(true);
			return defaultItem;
		};

		/*****************
		 * SET FUNCTIONS *
		 *****************/	
	
		var setItemDuration = function(item, duration) {
			item.querySelector(".duration").innerHTML = duration;
		};
		var setItemName = function(item, name) {
			item.querySelector(".item-name").innerHTML = name;
		};
		var setItemColor = function(item, color) {
			item.style.backgroundColor = color;
		};

		var setItemHeight = function(item, height) {
			item.style.height = height + "px";
		};


		/************************
		 * ITEM DELETE / CREATE *
		 ************************/	

		var deleteItem = function(item) {
			// item.outerHTML = "";
			item.parentNode.removeChild(item);
		};

		var deleteAllItems = function() {
			hideMenu();

			// removes all items
			var itemsContainer = getItemsContainer();
			while (itemsContainer.firstChild) {
				itemsContainer.removeChild(itemsContainer.firstChild);
			}
		};

		var createItem = function(where, behind, item) {
			var defaultItem;
			if (!item) {
				defaultItem = getDefaultItemClone();
			} else {
				defaultItem = item;
			}

			var newItem;
			if (behind) {
				// adds item behind "where"
				newItem = where.parentNode.insertBefore(defaultItem, where.nextSibling);
			} else { 
				// adds item inside "where"
				newItem = where.appendChild(defaultItem);
			}

			// add onclick event on newly created item
			newItem.querySelector(".content").onclick = function() {
				openItem(this.parentNode);
			};

			return newItem;
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
		hide(getMenu());
	};

	var refreshMenu = function() {
		var openedItem = getOpenedItem();

		// refresh change item name input
		document.getElementById("name-input").value = getItemName(openedItem);
		// refresh duration input
		document.getElementById("duration-input").value = getItemDuration(openedItem);
	};

	/***************
	 * SAVE / LOAD *
	 ***************/

	var saveAppState = function() {
		var data = {};
		var items = getItems();

		for (var i = 0; i < items.length; i++) {
			data[i] = {
				"name": getItemName(items[i]),
				"duration": getItemDuration(items[i]),
				"color": getItemColor(items[i])
			};
		}
		
		Storage.save(data, "data");
	};

	var loadAppState = function() {
		deleteAllItems();

		var items = Storage.load("data");

		if (items) {		
			for (var i = 0; i < Object.keys(items).length; i++) {
				var defaultItem = getDefaultItemClone();

				setItemDuration(defaultItem, items[i].duration);
				setItemName(defaultItem, items[i].name);
				setItemColor(defaultItem, items[i].color);

				createItem(getItemsContainer(), false, defaultItem);

			}
		} else {
			resetAppState();
		}

		resetItemsHeight();
		recalculateTimes();
	};

	var resetAppState = function() {
		var itemsContainer = getItemsContainer();

		deleteAllItems();

		for (var i = 0; i < 5; i++) {
			createItem(itemsContainer, false);
		}

		resetItemsHeight();
		recalculateTimes();
	};

	/********
	 * INIT *
	 ********/

	var init = function() {
		loadAppState();

		// initialize menu
		menuInit();

		// reset button
		document.getElementById("reset").onclick = resetAppState;

		// save button
		document.getElementById("save").onclick = saveAppState;

		// load button
		document.getElementById("load").onclick = loadAppState;

	};

	var menuInit = function() {
		menu = document.getElementById('menu');

		// add button init
		var addButton = document.getElementById("add-item");
		addButton.onclick = function() {
			// add default item behind selected item
			newItem = createItem(getOpenedItem(), true);

			// opens menu on newly created item
			openItem(newItem);

			// recalculate times
			recalculateTimes();

			saveAppState();
		};
	
		// delete button init
		var deleteButton = document.getElementById("delete-item");
		deleteButton.onclick = function() {
			var openedItem = getOpenedItem();

			hideMenu();
			
			// delete current item
			deleteItem(openedItem);

			// recalculate times
			recalculateTimes();

			saveAppState();
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
			recalculateTimes();

			saveAppState();
		};

		var changeDuration = function(amount) {
			if (Lib.isNumber(amount) && amount >= minItemInterval && amount <= maxItemInterval) {

				getOpenedItem().querySelector(".duration").innerHTML = Math.round(amount);

				resizeOpenedItem(amount);
				recalculateTimes();

				saveAppState();
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
			setItemName(getOpenedItem(), this.value);

			saveAppState();
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
				setItemColor(getOpenedItem(), getItemColor(this));

				saveAppState();
			};
		}
	};

	return {
		init: init
	};
}();
