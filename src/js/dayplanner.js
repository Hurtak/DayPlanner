var DayPlanner = function() {
	var menu;

	var minItemHeight = 42; // px
	var maxItemHeight = 200; // px

	var minOpenedItemHeight = 200; // px
	var maxOpenedItemHeight = 250; // px

	var minItemInterval = 1; // minutes
	var maxItemInterval = 600; // minutes

	var maxItemNameLength = 50;
	var maxSaveNameLength = 40;

	// regex patterns for html5 input validation
	var startTimePattern = "^(0?[0-9]|1[0-9]|2[0-4]):[0-5][0-9]$"; // e.g.: "00:00"
	var durationPattern = "^([1-9][0-9]?|[1-5][0-9]{2}|600)$"; // 1 - 600 range

	// *** ITEMS ***

		// create items

			var createItem = function(where, behind, firstItem, item) {
				if (typeof(item) === "undefined") {
					item = getDefaultItemClone();
				}

				var newItem;
				if (behind) {
					// adds item behind "where"
					newItem = where.parentNode.insertBefore(item, where.nextSibling);
				} else { 
					// adds item inside "where"
					newItem = where.appendChild(item);
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
				if (moveUp && !isFirstItem(item)) {
					//move up
					item.parentNode.insertBefore(item, item.previousSibling);

					if (isFirstItem(item)) {
						// move 2nd item to 1st item position
						hide(document.getElementById("delete-item"));
						setStartTimeInputReadonly(false);

						// moves start time div to first item
						getItems()[0].appendChild(getStartTimeDiv());
					}
				} else if (!moveUp && !isLastItem(item)) {
					//move down
					item.parentNode.insertBefore(item.nextSibling, item);

					if (isFirstItem(item.previousSibling)) {
						// move 1st item to 2nd item position
						show(document.getElementById("delete-item"));
						setStartTimeInputReadonly(true);

						getItems()[0].appendChild(getStartTimeDiv());
					}
				}

			};

		// default item

			var getDefaultItemClone = function() {
				var defaultItem = document.getElementById("default-item").children[0];
				defaultItem = defaultItem.cloneNode(true);
				return defaultItem;
			};

			var getDefaultSaveClone = function() {
				var defaultSave = document.getElementById("default-save").children[0];
				defaultSave = defaultSave.cloneNode(true);
				return defaultSave;
			};

		// resize

			var setItemHeight = function(item, height) {
				item.style.height = Math.round(height) + "px";
			};

			var resizeOpenedItem = function(minutes) {
				minutes = minutes * 1;
				minutes = Lib.linearConversion(
					minutes,
					minItemInterval,
					maxItemInterval,
					minOpenedItemHeight,
					maxOpenedItemHeight
				);
				setItemHeight(getOpenedItem(), minutes);
			};

			var resetItemsHeight = function() {
				var items = getItems();
				var minutes;
				for (var i = 0; i < items.length; i++) {
					minutes = getItemDuration(items[i]);
					minutes = minutesToHeight(minutes);

					setItemHeight(items[i], minutes);
				}
			};

			// translates items interval to items height. intervals smaller than
			// 90 will be more visually distinguished between each other (e.g.:
			// difference between 30 and 60 min will be bigger than 330 and 360)
			var minutesToHeight = function(minutes) {
				var rangeSplit = 90; // <minItemHeight;90) <90;maxItemHeight> 
				var marginalHeight = 120; // marginal height for ranges transition (90 min == 120 px)

				if (minutes < rangeSplit) {
					minutes = Lib.linearConversion(
						minutes,
						minItemInterval,
						rangeSplit,
						minItemHeight,
						marginalHeight
					);
				} else {
					minutes = Lib.linearConversion(
						minutes, 
						rangeSplit, 
						maxItemInterval, 
						marginalHeight, 
						maxItemHeight
					);
				}

				return minutes;
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
				var items = item.parentNode;
				if (items.children[0] === item) {
					return true;
				} else {
					return false;
				}
			};

			var isLastItem = function(item) {
				var items = item.parentNode;
				if (items.children[items.children.length - 1] === item) {
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
			// var minTime = getStartTime;
			// var maxTime = getItems();
			// maxTime = maxTime[maxTime.length - 1].querySelector(".time").value;
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
			var data = Storage.load("data");
			if (data === null) {
				data = [];
			}

			var items = getItems();
			var saveIndex = getItemIndex(getOpenedSave());

			data[saveIndex] = {
				"name": getSaveNameInput(getOpenedSave()).value,
				"items": []
			};

			for (var i = 0; i < items.length; i++) {
				data[saveIndex].items[i] = {
					"name": getItemName(items[i]),
					"duration": getItemDuration(items[i]),
					"color": getItemColor(items[i])
				};
			}


			Storage.save(data, "data");
			saveStartTime();
		};

		var loadAppState = function(saveIndex) {
			if (typeof(saveIndex) === "undefined") {
				saveIndex = 0;
			}

			deleteAllItems();

			var data = Storage.load("data");

			if (data) {
				var numberOfSaves = data[saveIndex].items.length;

				if (numberOfSaves === 0) {
					// empty save created with new save button
					createItem(getItemsContainer(), false, true);
					saveAppState();
				} else {
					var item;

					for (var k = 0; k < numberOfSaves; k++) {
						item = getDefaultItemClone();

						setItemDuration(item, data[saveIndex].items[k].duration);
						setItemName(item, data[saveIndex].items[k].name);
						setItemColor(item, data[saveIndex].items[k].color);

						createItem(getItemsContainer(), false, k === 0 ? true : false, item);
					}
				}

			} else {
				resetAppState();
			}

			loadStartTime();

			resetItemsHeight();
			recalculateTimes();
		};

		var resetAppState = function(numberOfItems) {
			Storage.save([], "data");
			saveOpenedSaveIndex(0);

			var itemsContainer = getItemsContainer();

			deleteAllItems();
			deleteAllSaves();

			createItem(itemsContainer, false, true);
			for (var i = 1; i < numberOfItems; i++) {
				createItem(itemsContainer, false, false);
			}

			createSaveDiv("Default save");
			openSave(getSaves()[0]);

			setStartTime("00:00");

			resetItemsHeight();
			recalculateTimes();

			saveAppState();
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

			// reset button
			document.getElementById("reset").onclick = function() {
				var dialog = confirm("Are you sure?");
				if (dialog) {
					resetAppState(5);
				}
			};

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

			var animationsCheckbox = document.getElementById("animations-checkbox");
			animationsCheckbox.checked = true;
			animationsCheckbox.onclick = function() {
				var animationsStyle = document.getElementById("animations-style");
				if (this.checked) {
					animationsStyle.disabled = false;
				} else {
					animationsStyle.disabled = true;
				}
			};

			loadAppState(loadOpenedSaveIndex());
			loadSavePositions();

			menuInit();

			saveInit();

			initTime();



			// debug functions

				document.getElementById("save").onclick = saveAppState;
				document.getElementById("load").onclick = loadAppState;

				document.getElementById("test").onclick = function() {
					console.log(

						getItemIndex(getOpenedSave())

					);
				};
		};

		var menuInit = function() {
			menu = document.getElementById('menu');

			var addButton = document.getElementById("add-item");
			addButton.onclick = function() {
				// opened item needs to be initialized before hiding menu because opened item is located based on menu location
				var openedItem = getOpenedItem(); 

				hideMenu();

				newItem = createItem(openedItem, true, false, openedItem.cloneNode(true));
				openItem(newItem);

				recalculateTimes();
				saveAppState();
			};

			var deleteButton = document.getElementById("delete-item");
			deleteButton.onclick = function() {
				var dialog = confirm("Are you sure?");
				if (dialog) {
					// opened item needs to be initialized before hiding menu because opened item is located based on menu location					
					var openedItem = getOpenedItem();

					hideMenu();

					deleteItem(openedItem);

					recalculateTimes();
					saveAppState();
				}
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
				saveAppState();
			};

			var moveDownButton = document.getElementById("move-down");
			moveDownButton.onclick = function() {
				moveItem(getOpenedItem(), false);

				recalculateTimes();
				saveAppState();
			};			
		};




		var saveInit = function() {
			document.getElementById("add-save").onclick = function() {
				var name = Math.round(Math.random() * 10000);
				createSaveDiv(name);
				createNewSave(name);


			};


			var saveMenu = getSaveMenu();

			var deleteButton = document.getElementById("delete-save");
			deleteButton.onclick = function() {
				var dialog = confirm("Are you sure?");
				if (dialog) {
					var openedSave = getOpenedSave();
					var saveWithMenu = getSaveWithMenu();

					if (openedSave !== saveWithMenu) {
						hideAndMove(getSaveMenu());
					}

					deleteSave(saveWithMenu);
				}
			};

			var copyButton = document.getElementById("copy-save");
			copyButton.onclick = function() {
				var name = getSaveNameInput(getSaveWithMenu()).value;
				createSaveDiv(name);
			};
	
			var moveUpButton = document.getElementById("move-save-up");
			moveUpButton.onclick = function() {
				moveItem(getSaveWithMenu(), true);
				moveSave(getSaveWithMenu(), true);
			};

			var moveDownButton = document.getElementById("move-save-down");
			moveDownButton.onclick = function() {
				moveItem(getSaveWithMenu(), false);
				moveSave(getSaveWithMenu(), false);
			};

		};






	var createSaveDiv = function(name) {
		var newSave = getDefaultSaveClone();
		var saveName = getSaveNameInput(newSave);

		saveName.value = name;

		var saveOptions = newSave.querySelector(".save-options");
		saveOptions.onclick = function() {
			if (saveName.readOnly) {
				hideSaveMenu();
				showSaveMenu(newSave);
			} else {
				hideSaveMenu();
			}
		};

		var overlay = newSave.querySelector(".overlay");
		overlay.onclick = function() {
			closeSaves();
			hideSaveMenu();

			openSave(this.parentNode);

			loadAppState(getItemIndex(getOpenedSave()));

			saveOpenedSaveIndex();
		};

		var nameInput = newSave.querySelector(".save-name");
		nameInput.oninput = function() {
			setSaveName(getSaveWithMenu(), this.value);
			saveSaveName(getSaveWithMenu(), this.value);
		};

		getSaveContainer().appendChild(newSave);
	};



	// save save functions
		var createNewSave = function(name) {
			var data = Storage.load("data");

			data.push({
				"name": name,
				"items": []
			});

			Storage.save(data, "data");
		};

		var deleteSave = function(save) {
			// deletes from local storage
			var data = Storage.load("data");

			data.splice(getItemIndex(save), 1);

			Storage.save(data, "data");
			
			// deletes div
			deleteItem(save);
		};

		var moveSave = function(save, moveUp) {
			// deletes from local storage
			var data = Storage.load("data");
			var tmp;
			var savePosition = getItemIndex(save);
			var positionChange = 1;
			if (!moveUp) {
				positionChange = -1;
			}

			tmp = data[savePosition + positionChange];
			data[savePosition + positionChange] = data[savePosition];
			data[savePosition] = tmp;


			Storage.save(data, "data");

			saveOpenedSaveIndex();
		};

		var saveSaveName = function(save, name) {
			var data = Storage.load("data");
			var savePosition = getItemIndex(save);

			data[savePosition].name = name;

			Storage.save(data, "data");
		};

		var saveOpenedSaveIndex = function(index) {
			if (typeof(index) === "undefined") {
				index = getItemIndex(getOpenedSave());
			}

			Storage.save(index, "save-position");
		};

		var loadOpenedSaveIndex = function() {
			return Storage.load("save-position");
		};

		var loadSavePositions = function() {
			var data = Storage.load("data");

			for (var i = 0; i < data.length; i++) {

				createSaveDiv(data[i].name);

			}

			openSave(getSaves()[loadOpenedSaveIndex()]);
		};




	var setSaveName = function(save, name) {
		var nameInput = getSaveNameInput(save);

		if (name.length > maxSaveNameLength) {
			name = name.substring(0, maxSaveNameLength);
		}				
		nameInput.value = name;

	};


	var showSaveMenu = function(save) {
		var saveName = getSaveNameInput(save);
		var saveMenu = getSaveMenu();

		saveName.readOnly = false;
		save.appendChild(saveMenu);

		hide(getOverlay(save));

		setTimeout(function() {
			saveMenu.setAttribute("data-animate", "");
		}, 1);
	};

	var hideSaveMenu = function() {		
		var saveMenu = getSaveMenu();

		var saveWithMenu = saveMenu.parentNode;
		var saveName = getSaveNameInput(saveWithMenu);

		saveName.readOnly = true;
		show(getOverlay(saveWithMenu));
		saveMenu.removeAttribute("data-animate");
	};

	var getOpenedSave = function() {
		return getSaveContainer().querySelector(".save.selected");
	};

	var openSave = function(save) {
		save.className += " selected";
	};

	var closeSaves = function() {
		getSaveContainer().querySelector(".selected").classList.remove("selected");
	};


	var getSaveContainer = function() {
		return document.getElementById("save-container");
	};

	var getSaves = function() {
		return getSaveContainer().querySelectorAll(".save");
	};

	var getSaveNameInput = function(save) {
		return save.querySelector(".save-name");
	};

	var getSaveMenu = function() {
		return document.getElementById("save-menu");
	};

	var getSaveWithMenu = function() {
		return getSaveMenu().parentNode;
	};

	var getItemIndex = function(item) {
		return Array.prototype.indexOf.call(item.parentNode.children, item);
	};

	var deleteAllSaves = function() {
		var saves = getSaves();

		for (var i = 0; i < saves.length; i++) {
			deleteItem(saves[i]);
		}
	};


	return {
		init: init
	};
}();
