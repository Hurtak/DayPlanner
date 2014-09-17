var DayPlanner = function() {
	var menu;

	var minItemHeight = 40; // px
	var maxItemHeight = 180; // px	
	
	var minOpenedItemHeight = 200; // px
	var maxOpenedItemHeight = 250; // px

	var minItemInterval = 1; // min
	var maxItemInterval = 600; // min

	var maxItemNameLength = 50;

	// regex patterns for html5 input validation
	var startTimePattern = "^(0?[0-9]|1[0-9]|2[0-4]):[0-5][0-9]$";
	var durationPattern = "^([1-9][0-9]?|[1-5][0-9]{2}|600)$"; // 1 - 600

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
					openItem(this.parentNode); // overlay is element with :hover and child element of item
				};

				var durationInput = getItemDurationInput(newItem);
				durationInput.setAttribute("pattern", durationPattern);
				durationInput.oninput = function() {
					// backward compatibility: <input onchange="doSomething();" onkeypress="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();">
					changeDuration(this.value);
				};

				durationInput.onblur = function() {
					var duration = this.value;

					if (!Lib.isNumber(duration)) {
						duration = 60;
					} else if (duration > maxItemInterval) {
						duration = maxItemInterval;
					} else if (duration < minItemInterval) {
						duration = minItemInterval;
					}

					changeDuration(duration);
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

		// move item

			var moveItem = function(item, moveUp) {

				if (moveUp) {
					item.parentNode.insertBefore(item, item.previousSibling);
				} else { // move down
					item.parentNode.insertBefore(item.nextSibling, item);
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
				item.style.height = height + "px";

				// getItemDurationDiv(item).style.lineHeight = height + "px"; 
				// getItemNameDiv(item).style.lineHeight = height + "px"; 
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
					var minutes = getItemDuration(items[i]);
					minutes = Lib.linearConversion(minutes, minItemInterval, maxItemInterval, minItemHeight, maxItemHeight);

					setItemHeight(items[i], minutes);
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

			var isFirstItem = function(item) {
				var items = getItems();
				if (items[0] === item) {
					return true;
				} else {
					return false;
				}
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
				if (name.length > maxItemNameLength) {
					name = name.substring(0, maxItemNameLength);
				}				
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

			var openedItem = getOpenedItem();

			if (isFirstItem(item)) {
				// first item
				hide(document.getElementById("delete-item"));
				setStartTimeInputReadonly(false); // changes readonly of start time input
			} else {
				// other items
				show(document.getElementById("delete-item"));
			}
			
			// changes readonly on duration and name inputs
			getItemDurationInput(item).readOnly = false;
			getItemNameInput(item).readOnly = false;
			hide(getOverlay(item));

			refreshMenu();
		};

		var hideMenu = function() {
			var openedItem = getOpenedItem();

			// changes readonly on duration and name inputs
			getItemDurationInput(openedItem).readOnly = true;
			getItemNameInput(openedItem).readOnly = true;
			show(getOverlay(openedItem));

			if (isFirstItem(openedItem)) {
				setStartTimeInputReadonly(true); // changes readonly of start time input
			}

			hideAndMove(getMenu());
		};

		var refreshMenu = function() {
			// var openedItem = getOpenedItem();
		};

	// *** CURRENT TIME ***
	
		var initTime = function() {
			var minTime = getStartTime;
			var maxTime = getItems();
			maxTime = maxTime[maxTime.length - 1].querySelector(".time").value;

		};

	// *** TIME ***

		var getStartTimeDiv = function() {
			return getStartTimeInput().parentNode;
		};

		var getStartTimeInput = function() {
			return document.getElementById("start-time");
		};

		var getStartTime = function() {
			return getStartTimeInput().value;
		};	
		
		var setStartTime = function(time) {
			getStartTimeInput().value = time;
		};

		var setStartTimeInputReadonly = function(readOnlyValue) {
			getStartTimeInput().readOnly = readOnlyValue;
		};

		var recalculateTimes = function() {
			var items = getItems();

			var previousTime = getStartTime();
			for (var i = 0; i < items.length; i++) {
				items[i].querySelector(".time-input").value = Time.minutesToTime(Time.timeToMinutes(previousTime) + getItemDuration(items[i]));
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
			saveStartTime();
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

			loadStartTime();

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

			setStartTime("00:00");

			resetItemsHeight();
			recalculateTimes();
		};

		var saveStartTime = function() {
			Storage.save(getStartTime(), "start-time");
		};

		var loadStartTime = function() {
			setStartTime(Storage.load("start-time"));
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

			var startTimeInput = getStartTimeInput();

			startTimeInput.oninput = function() {
				var time = this.value;
				var pattern = new RegExp(startTimePattern);

				if (pattern.test(time)) {
					recalculateTimes();

					saveAppState();
				}
			};

			startTimeInput.onblur = function() {
				loadStartTime();
				var time = this.value;

				// changes 0:00 to 00:00
				if (time.length < 5) {
					this.value = "0" + time; 
				}
			};

			loadAppState();

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

			var addButton = document.getElementById("add-item");
			addButton.onclick = function() {
				// add default item behind selected item
				newItem = createItem(getOpenedItem(), true, false);

				// opens menu on newly created item
				openItem(newItem);

				recalculateTimes();

				saveAppState();
			};

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
			var colors = document.getElementById("colors");
			colors.addEventListener('click', function(e){
				setItemColor(getOpenedItem(), getItemColor(e.target));

				saveAppState();
			});

			var moveUpButton = document.getElementById("move-up");
			moveUpButton.onclick = function() {
				moveItem(getOpenedItem(), true);

				recalculateTimes();
				// saveAppState();
			};


			var moveDownButton = document.getElementById("move-down");
			moveDownButton.onclick = function() {
				moveItem(getOpenedItem(), false);

				recalculateTimes();
				// saveAppState();
			};			
		};

	return {
		init: init
	};
}();
