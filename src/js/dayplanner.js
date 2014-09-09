var DayPlanner = function() {
	var menu;

	var minOpenedItemHeight = 100; // px
	var maxOpenedItemHeight = 300; // px

	var minItemInterval = 1; // min
	var maxItemInterval = 120; // min

	var menuOffset = 50; // px

	var startTime = "00:00";

	// *** ITEMS ***

		// create items
			var createItem = function(where, behind, firstItem, item) {
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

				if (firstItem) {
					// if its first item in the list, we need to add start-time div
					newItem.appendChild(getStartTimeDiv());
				}

				// add onclick event on newly created item
				getOverlay(newItem).onclick = function() {
					openItem(this.parentNode);
				};

				getItemDurationInput(newItem).oninput = function() {
					// It's not quite magic to make onchange fire on all those actions.  <input onchange="doSomething();" onkeypress="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"> will do well enough for most
					changeDuration(this.value);
				};

				// changes name of item
				getItemNameInput(newItem).oninput = function() {
					setItemName(getOpenedItem(), this.value);

					// TODO mayby save on menu close
					saveAppState();
				};

				return newItem;
			};

		// delete items

			var deleteItem = function(item) {
				// item.outerHTML = "";
				item.parentNode.removeChild(item);
			};

			var deleteAllItems = function() {
				hideMenu();

				// moves start-time div so its not deleted
				hideAndMove(getStartTimeDiv());

				// removes all items
				var items = getItems();
				for (var i = 0; i < items.length; i++) {
					deleteItem(items[i]);
				}
			};

		// deafult item

			var getDefaultItemClone = function() {
				var defaultItem = document.getElementById("default-item").children[0];
				defaultItem = defaultItem.cloneNode(true);
				return defaultItem;
			};

		// resize

			var setItemHeight = function(item, height) {
				height = height + "px";

				item.style.height = height;
				// getItemDurationDiv(item).style.lineHeight = height; 
				// getItemNameDiv(item).style.lineHeight = height; 
			};

			var resizeOpenedItem = function(minutes) {
				minutes = minutes * 1;
				minutes = Lib.linearConversion(minutes, minItemInterval, maxItemInterval, minOpenedItemHeight, maxOpenedItemHeight);
				setItemHeight(getOpenedItem(), Math.round(minutes));
			};

			var resetItemsHeight = function() {
				// set height according to duration (1 minute = 1px)
				var items = getItems();
				for (var i = 0; i < items.length; i++) {
					setItemHeight(items[i], getItemDuration(items[i]));
				}
			};

		// open

			var openItem = function(item) {
				hideMenu();
				showMenu(item);
				resetItemsHeight();
				resizeOpenedItem(getItemDuration(item));
			};

			var getOpenedItem = function() {
				return getMenu().parentNode;
			};

		// general

			var getItemsContainer = function() {
				return document.getElementById("items-container");
			};

			var getItems = function() {
				return getItemsContainer().querySelectorAll(".item");
			};

			var getStartTimeDiv = function() {
				return document.getElementById("start-time");
			};

		// item name

			var getItemNameDiv = function(item) {
				return item.querySelector(".item-name");
			};

			var getItemNameInput = function(item) {
				return getItemNameDiv(item).getElementsByTagName('input')[0];
			};

			var getItemName = function(item) {
				return getItemNameInput(item).value.trim();
			};

			var setItemName = function(item, name) {
				getItemNameInput(item).value = name;
			};

		// item duration

			var getItemDurationDiv = function(item) {
				return item.querySelector(".duration");
			};

			var getItemDurationInput = function(item) {
				return getItemDurationDiv(item).getElementsByTagName('input')[0];
			};

			var getItemDuration = function(item) {
				return getItemDurationInput(item).value.trim() * 1;
			};

			var setItemDuration = function(item, duration) {
				getItemDurationInput(item).value = duration;
			};

		// item duration functions

			var addDuration = function(amount) {
				var durationInput = getItemDurationInput(getOpenedItem());

				amount = amount * 1 + durationInput.value * 1;
				if (amount < minItemInterval) {
					amount = minItemInterval;
				} else if (amount > maxItemInterval) {
					amount = maxItemInterval;
				}

				setItemDuration(getOpenedItem(), amount);
				durationInput.value = amount;

				resizeOpenedItem(amount);
				recalculateTimes();

				saveAppState();
			};

			var changeDuration = function(amount) {
				if (Lib.isNumber(amount) && amount >= minItemInterval && amount <= maxItemInterval) {

					setItemDuration(getOpenedItem(), Math.round(amount));

					resizeOpenedItem(amount);
					recalculateTimes();

					saveAppState();
				}
			};

		// item color

			var getItemColor = function(item) {
				return item.style.backgroundColor;
			};

			var setItemColor = function(item, color) {
				item.style.backgroundColor = color;
			};

		// item overlay (for click events)

			var getOverlay = function(item) {
				return item.querySelector(".overlay");
			};

	// *** MENU ***

		var getMenu = function() {
			return document.getElementById("menu");
		};

		var isMenuShown = function() {
			if (getItemsContainer().querySelector("#menu")) {
				return true;
			}
			return false;
		};

		var showMenu = function(item) {

			item.appendChild(getMenu());

			var itemsContainer = getItemsContainer();
			if (item === itemsContainer.firstChild) {
				hide(document.getElementById("delete-item"));
			} else {
				show(document.getElementById("delete-item"));
			}
			
			var openedItem = getOpenedItem();

			getItemDurationInput(openedItem).readOnly = false;
			getItemNameInput(openedItem).readOnly = false;
			hide(getOverlay(openedItem));

			refreshMenu();
		};

		var hideMenu = function() {
			var openedItem = getOpenedItem();

			getItemDurationInput(openedItem).readOnly = true;
			getItemNameInput(openedItem).readOnly = true;
			show(getOverlay(openedItem));

			hideAndMove(getMenu());
		};

		var refreshMenu = function() {
			// var openedItem = getOpenedItem();
		};

	// *** CURRENT TIME ***
	
		var initTime = function() {
			var minTime = startTime;
			var maxTime = getItems();
			maxTime = maxTime[maxTime.length - 1].querySelector(".time").innerHTML;

		};

	// *** GENERAL ***

		var recalculateTimes = function() {
			var items = getItems();

			var previousTime = startTime;
			for (var i = 0; i < items.length; i++) {
				items[i].querySelector(".time").innerHTML = Time.minutesToTime(Time.timeToMinutes(previousTime) + getItemDuration(items[i]));
				previousTime = Time.minutesToTime(getItemDuration(items[i]) + Time.timeToMinutes(previousTime));
			}
		};

	// *** SAVE / LOAD ***

		var saveAppState = function() {
			var data = [];
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
				for (var i = 0; i < items.length; i++) {
					var defaultItem = getDefaultItemClone();

					setItemDuration(defaultItem, items[i].duration);
					setItemName(defaultItem, items[i].name);
					setItemColor(defaultItem, items[i].color);

					createItem(getItemsContainer(), false, i === 0 ? true : false, defaultItem);

				}
			} else {
				resetAppState();
			}

			resetItemsHeight();
			recalculateTimes();
		};

		var resetAppState = function(numberOfItems) {
			var itemsContainer = getItemsContainer();

			deleteAllItems();

			createItem(itemsContainer, false, true);
			for (var i = 1; i < numberOfItems; i++) {
				createItem(itemsContainer, false, false);
			}

			resetItemsHeight();
			recalculateTimes();
		};

	// *** HIDE / SHOW ***

		var hideAndMove = function(element) {
			document.getElementById("hide").appendChild(element);
		};

		var hide = function(element) {
			element.className += " hidden";
		};

		var show = function(element) {
			element.classList.remove('hidden');
		};

	// *** INIT ***

		var init = function() {
			// initialize first time in items start/end times 
			getStartTimeDiv().innerHTML = startTime;

			loadAppState();

			// initialize menu
			menuInit();

			initTime();

			// reset button
			document.getElementById("reset").onclick = function() {resetAppState(5);};

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
				newItem = createItem(getOpenedItem(), true, false);

				// opens menu on newly created item
				openItem(newItem);

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

			var plusButton = document.getElementById("duration-plus");
			plusButton.onclick = function() {
				addDuration(10);
			};

			var minusButton = document.getElementById("duration-minus");
			minusButton.onclick = function() {
				addDuration(-10);
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
