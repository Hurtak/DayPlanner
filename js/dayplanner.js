"use strict";

var DayPlanner = function() {
  var tadd;

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
  var startTimePattern = "^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"; // e.g.: "00:00"
  var durationPattern = "^([1-9][0-9]?|[1-5][0-9]{2}|600)$"; // 1 - 600 range

  var debugMode = false;

  // **** GENERAL ***

    var getElementIndex = function(element) {
      return Array.prototype.indexOf.call(element.parentNode.children, element);
    };

    var isFirstElement = function(element) {
      return element.parentNode.children[0] === element;
    };

    var isLastElement = function(element) {
      var items = element.parentNode;
      if (items.children[items.children.length - 1] === element) {
        return true;
      } else {
        return false;
      }
    };

    var moveElement = function(element, moveUp) {
      if (moveUp && !isFirstElement(element)) {
        //move up
        element.parentNode.insertBefore(element, element.previousSibling);
        return true;
      } else if (!moveUp && !isLastElement(element)) {
        //move down
        element.parentNode.insertBefore(element.nextSibling, element);
        return true;
      }

      return false;
    };

    var getOverlay = function(item) {
      return item.querySelector(".overlay");
    };

  // *** ITEMS ***

    // create items

      var createItem = function(where, item) {
        if (typeof item === "undefined") {
          item = getDefaultItemClone();
        }

        var newItem;
        if (where === getItemsContainer()) {
          // adds item inside "where" which is items container
          newItem = where.appendChild(item);
        } else {
          // adds item behind "where"
          newItem = where.parentNode.insertBefore(item, where.nextSibling);
        }

        if (getItems().length === 1) {
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
          changeDuration(this.value, false);
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

          changeDuration(duration, true);
        };

        // changes name of item
        var nameInput = getItemNameInput(newItem);
        nameInput.setAttribute("maxlength", maxItemNameLength);
        nameInput.oninput = function() {
          saveItems();
        };

        return newItem;
      };

    // delete items

      var deleteElement = function(element) {
        element.parentNode.removeChild(element);
      };

      var deleteAllItems = function() {
        hideMenu();

        // moves start-time div so its not deleted
        hideAndMove(getStartTimeDiv());

        // removes all items
        var items = getItems();
        for (var i = 0; i < items.length; i++) {
          deleteElement(items[i]);
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

    // item name

      var getItemNameDiv = function(item) {
        return item.querySelector(".item-name");
      };

      var getItemNameInput = function(item) {
        return getItemNameDiv(item).getElementsByTagName("input")[0];
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
        return getItemDurationDiv(item).getElementsByTagName("input")[0];
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

        saveItems();
      };

      var changeDuration = function(amount, rewriteInput) {
        if (Lib.isNumber(amount) && amount >= minItemInterval && amount <= maxItemInterval) {
          if (rewriteInput) {
            setItemDuration(getOpenedItem(), Math.round(amount));
          }

          resizeOpenedItem(amount);
          recalculateTimes();

          saveItems();
        }
      };

    // item color

      var getItemColor = function(item) {
        return item.style.backgroundColor;
      };

      var setItemColor = function(item, color) {
        item.style.backgroundColor = color;
      };

  // *** ITEMS MENU ***

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

      if (isFirstElement(item)) {
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
    };

    var hideMenu = function() {
      var openedItem = getOpenedItem();

      // changes readonly on duration and name inputs
      getItemDurationInput(openedItem).readOnly = true;
      getItemNameInput(openedItem).readOnly = true;
      show(getOverlay(openedItem));

      if (isFirstElement(openedItem)) {
        setStartTimeInputReadonly(true); // changes readonly of start time input
      }

      hideAndMove(getMenu());
    };

  // *** SAVES ***

    var getSaveContainer = function() {
      return document.getElementById("save-container");
    };

    var getSaves = function() {
      return getSaveContainer().querySelectorAll(".save");
    };

    var getOpenedSave = function() {
      return getSaveContainer().querySelector(".save.selected");
    };

    var getSaveWithMenu = function() {
      return getSaveMenu().parentNode;
    };

    var getSaveNameInput = function(save) {
      return save.querySelector(".save-name");
    };


    var openSave = function(save) {
      save.className += " selected";
    };

    var closeSaves = function() {
      getSaveContainer().querySelector(".selected").classList.remove("selected");
    };


    var deleteAllSaves = function() {
      var saves = getSaves();

      for (var i = 0; i < saves.length; i++) {
        deleteElement(saves[i]);
      }
    };

    var moveSave = function(save, moveUp) {
      var positionChange = 1;
      if (!moveUp) {
        positionChange = -1;
      }

      var data = loadData();

      var savePosition = getElementIndex(save);
      var tmp = data[savePosition + positionChange];
      data[savePosition + positionChange] = data[savePosition];
      data[savePosition] = tmp;

      saveData(data);

      saveOpenedSaveIndex();
    };

    var saveNewSave = function(name, startTime, items, index) {
      if (typeof startTime === "undefined") {
        startTime = "00:00";
      }
      if (typeof items === "undefined") {
        items = [];
      }

      var data = loadData();
      if (typeof index === "undefined") {
        // no argument, data will be inserted in last position
        index = data.length;
      }

      data.splice(index, 0, {
        "name": name,
        "startTime": startTime,
        "items": items
      });

      saveData(data);
    };

    var createSaveDiv = function(name, where) {
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
        var scrollPositionFromBottom = Lib.getDocumentHeight() - window.scrollY;

        closeSaves();
        hideSaveMenu();

        openSave(this.parentNode);

        loadItems(getElementIndex(getOpenedSave()));

        saveOpenedSaveIndex();

        window.scrollTo(0, Lib.getDocumentHeight() - scrollPositionFromBottom);
      };

      var nameInput = newSave.querySelector(".save-name");
      nameInput.oninput = function() {
        var save = getSaveWithMenu();

        if (this.value.length > maxSaveNameLength) {
          this.value = this.value.substring(0, maxSaveNameLength);
        }

        // saves changed name to local storage
        var data = loadData();
        var savePosition = getElementIndex(save);

        data[savePosition].name = this.value;

        saveData(data);
      };

      if (where === getSaveContainer()) {
        where.appendChild(newSave);
      } else {
        where.parentNode.insertBefore(newSave, where.nextSibling);
      }

    };

  // *** SAVE MENU ***

    var getSaveMenu = function() {
      return document.getElementById("save-menu");
    };

    var showSaveMenu = function(save) {
      getSaveNameInput(save).readOnly = false;

      var saveMenu = getSaveMenu();
      save.appendChild(saveMenu);

      hide(getOverlay(save));

      setTimeout(function() {
        saveMenu.setAttribute("data-animate", "");
      }, 1);
    };

    var hideSaveMenu = function() {
      var saveMenu = getSaveMenu();
      var saveWithMenu = saveMenu.parentNode;

      getSaveNameInput(saveWithMenu).readOnly = true;
      show(getOverlay(saveWithMenu));

      saveMenu.removeAttribute("data-animate");
    };

  // *** LOCAL STORAGE ***

    var saveData = function(data) {
      Storage.save("data", data);
    };

    var loadData = function() {
      return Storage.load("data");
    };

    var saveItems = function() {
      var data = loadData();
      if (data === null) {
        data = [];
      }

      var items = getItems();
      var saveIndex = getElementIndex(getOpenedSave());

      if (typeof data[saveIndex] !== "object") {
        data[saveIndex] = {};
      }

      data[saveIndex].name = getSaveNameInput(getOpenedSave()).value;
      data[saveIndex].items = [];

      for (var i = 0; i < items.length; i++) {
        data[saveIndex].items[i] = {
          "name": getItemName(items[i]),
          "duration": getItemDuration(items[i]),
          "color": getItemColor(items[i])
        };
      }

      saveData(data);
    };

    var loadItems = function(saveIndex) {
      if (typeof saveIndex === "undefined") {
        saveIndex = 0;
      }

      deleteAllItems();

      var data = loadData();

      if (data) {
        var numberOfSaves = data[saveIndex].items.length;

        if (numberOfSaves === 0) {
          // empty save created with new save button
          createItem(getItemsContainer());
          saveItems();
        } else {
          var item;

          for (var i = 0; i < numberOfSaves; i++) {
            item = getDefaultItemClone();

            setItemDuration(item, data[saveIndex].items[i].duration);
            setItemName(item, data[saveIndex].items[i].name);
            setItemColor(item, data[saveIndex].items[i].color);

            createItem(getItemsContainer(), item);
          }
        }

        setStartTime(data[saveIndex].startTime);
      } else {
        resetAppState(3);
      }

      resetItemsHeight();
      recalculateTimes();
    };

    var resetAppState = function(numberOfItems) {
      if (typeof numberOfItems === "undefined") {
        numberOfItems = 1;
      }

      saveData([]);
      saveOpenedSaveIndex(0);

      var itemsContainer = getItemsContainer();

      deleteAllItems();
      deleteAllSaves();

      for (var i = 0; i < numberOfItems; i++) {
        createItem(itemsContainer);
      }

      createSaveDiv("Save", getSaveContainer());
      openSave(getSaves()[0]);

      setStartTime("00:00");

      resetItemsHeight();
      recalculateTimes();

      saveItems();
      saveStartTime();
    };

    var saveStartTime = function(index) {
      if (typeof index === "undefined") {
        index = getElementIndex(getOpenedSave());
      }

      var data = loadData();

      data[index].startTime = getStartTime();

      saveData(data);
    };

    var loadStartTime = function(index) {
      if (typeof index === "undefined") {
        index = loadOpenedSaveIndex();
      }

      var data = loadData();
      var startTime = data[index].startTime;

      return startTime;
    };

    var saveOpenedSaveIndex = function(index) {
      if (typeof index === "undefined") {
        index = getElementIndex(getOpenedSave());
      }

      Storage.save("save-position", index);
    };

    var loadOpenedSaveIndex = function() {
      return Storage.load("save-position");
    };


    var loadSavePositions = function() {
      var data = loadData();

      for (var i = 0; i < data.length; i++) {
        createSaveDiv(data[i].name, getSaveContainer());
      }

      openSave(getSaves()[loadOpenedSaveIndex()]);
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

  // *** HIDE / SHOW ***

    var hideAndMove = function(element) {
      document.getElementById("hide").appendChild(element);
    };

    var hide = function(element) {
      element.className += " hidden";
    };

    var show = function(element) {
      element.classList.remove("hidden");
    };

  // *** INIT ***

    var init = function() {
      document.getElementById("reset").onclick = function() {
        var dialog = confirm("Do you really want to reset application? This will result in losing all of your saved data.");
        if (dialog) {
          resetAppState(3);
          location.reload(true);
        }
      };

      var startTimeInput = getStartTimeInput();

      startTimeInput.setAttribute("pattern", startTimePattern);

      startTimeInput.oninput = function() {
        var time = this.value;
        var pattern = new RegExp(startTimePattern);

        if (pattern.test(time)) {
          recalculateTimes();
          saveStartTime();
        }
      };

      startTimeInput.onblur = function() {
        this.value = loadStartTime();

        // changes 0:00 to 00:00
        if (this.value.length < 5) {
          this.value = "0" + this.value;
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

      loadItems(loadOpenedSaveIndex());
      loadSavePositions();

      menuInit();
      saveInit();
      saveMenuInit();
      timeInit();

      // debug functions
      if (debugMode) {
        document.getElementById("debug").style.display = "block";
        document.getElementById("test").onclick = function() {
          console.log(
            getElementIndex(getOpenedSave())
          );
        };
      }
    };

    var menuInit = function() {
      document.getElementById("add-item").onclick = function() {
        // opened item needs to be initialized before hiding menu because opened item is located based on menu location
        var openedItem = getOpenedItem();

        hideMenu();

        var clonedItem = openedItem.cloneNode(true);
        if (isFirstElement(openedItem)) {
          // removes start time div if its first item
          clonedItem.removeChild(clonedItem.querySelector(".start-time"));
        }

        var newItem = createItem(openedItem, clonedItem);
        openItem(newItem);

        recalculateTimes();
        saveItems();
      };

      document.getElementById("delete-item").onclick = function() {
        var dialog = confirm("Are you sure?");
        if (dialog) {
          // opened item needs to be initialized before hiding menu because opened item is located based on menu location
          var openedItem = getOpenedItem();

          hideMenu();

          deleteElement(openedItem);

          recalculateTimes();
          saveItems();
        }
      };

      document.getElementById("duration-plus").onclick = function() {
        addDuration(10);
      };

      document.getElementById("duration-minus").onclick = function() {
        addDuration(-10);
      };

      document.getElementById("hide-menu").onclick = function() {
        resetItemsHeight();
        hideMenu();
      };

      document.getElementById("colors").addEventListener("click", function(e){
        setItemColor(getOpenedItem(), getItemColor(e.target));
        saveItems();
      });

      document.getElementById("move-up").onclick = function() {
        var item = getOpenedItem();
        var itemMoved = moveElement(item, true);

        if (itemMoved) {
          if (isFirstElement(item)) {
            // 2nd item moved to 1st position
            hide(document.getElementById("delete-item"));
            setStartTimeInputReadonly(false);

            // moves start time div to first item
            getItems()[0].appendChild(getStartTimeDiv());
          }

          recalculateTimes();
          saveItems();
        }
      };

      document.getElementById("move-down").onclick = function() {
        var item = getOpenedItem();
        var itemMoved = moveElement(item, false);

        if (itemMoved) {
          if (isFirstElement(item.previousSibling)) {
            // move of 1st item to 2nd position
            show(document.getElementById("delete-item"));
            setStartTimeInputReadonly(true);

            getItems()[0].appendChild(getStartTimeDiv());
          }

          recalculateTimes();
          saveItems();
        }
      };
    };

    var saveInit = function() {
      document.getElementById("add-save").onclick = function() {
        var name = "Save";
        createSaveDiv(name, getSaveContainer());
        saveNewSave(name);
      };
    };

    var saveMenuInit = function() {
      document.getElementById("delete-save").onclick = function() {
        var dialog = confirm("Do you really want to delete this save?");
        if (dialog) {
          var saves = getSaves();
          if (saves.length > 1) {
            var saveWithMenu = getSaveWithMenu();

            hideAndMove(getSaveMenu());

            // deleting opened save
            if (saveWithMenu === getOpenedSave()) {
              var saveIndex = getElementIndex(saveWithMenu);
              if (isLastElement(saveWithMenu)) {
                saveIndex--;
              } else {
                saveIndex++;
              }

              closeSaves();
              openSave(saves[saveIndex]);

              loadItems(saveIndex);
            }

            // delete save from local storage
            var data = loadData();
            data.splice(getElementIndex(saveWithMenu), 1);
            saveData(data);

            // deletes div
            deleteElement(saveWithMenu);

            saveOpenedSaveIndex();
          } else {
            alert("You can't delete last save.");
          }
        }
      };

      document.getElementById("copy-save").onclick = function() {
        var save = getSaveWithMenu();
        var name = getSaveNameInput(save).value;
        var index = getElementIndex(save);

        var data = loadData();

        createSaveDiv(name, save);
        saveNewSave(name, data[index].startTime, data[index].items, index);
      };

      document.getElementById("move-save-up").onclick = function() {
        var save = getSaveWithMenu();
        var itemMoved = moveElement(save, true);

        if (itemMoved) {
          moveSave(save, true);
        }
      };

      document.getElementById("move-save-down").onclick = function() {
        var save = getSaveWithMenu();
        var itemMoved = moveElement(save, false);

        if (itemMoved) {
          moveSave(save, false);
        }
      };

    };

  return {
    init: init
  };

}();
