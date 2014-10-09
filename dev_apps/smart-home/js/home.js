'use strict';
/* global CardNavigator, KeyEvent, SelectionBorder, XScrollable */

(function(exports) {

  function $(id) {
    return document.getElementById(id);
  }

  function Home() {}

  Home.prototype = {
    navigableIds: ['search-input'],
    navigableClasses: ['filter-tab', 'command-button'],
    cardScrollable: new XScrollable('card-list-frame', 'card-list', 'card-thumbnail'),
    folderScrollable: new XScrollable('folder-list-frame', 'folder-list', 'folder-card-thumbnail'),
    navigableScrollable: [],

    init: function() {
      this.navigableScrollable = [this.cardScrollable, this.folderScrollable];
      var collection = this.getNavigateElements();
      this.cardNavigator = new CardNavigator(collection);
      this.selectionBorder = new SelectionBorder({ multiple: false,
                                                   container: $('main-section'),
                                                   forground: true });

      window.addEventListener('keydown', this.handleKeyEvent.bind(this));

      this.cardNavigator.on('focus', this.handleFocus.bind(this));

      var handleScrollableItemFocusBound =
                                    this.handleScrollableItemFocus.bind(this);
      this.navigableScrollable.forEach(function(scrollable) {
        scrollable.on('focus', handleScrollableItemFocusBound);
      });
      this.cardNavigator.focus();
    },

    handleKeyEvent: function(evt) {
      var key = this.convertKeyToString(evt.keyCode);
      switch (key) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          var focus = this.cardNavigator.getFocusedElement();
          if (focus.CLASS_NAME == 'XScrollable') {
            if (focus.cardNavigator.move(key)) {
              return;
            }
          }
          this.cardNavigator.move(key);
      }
    },

    convertKeyToString: function(keyCode) {
      switch (keyCode) {
        case KeyEvent.DOM_VK_UP:
          return 'up';
        case KeyEvent.DOM_VK_RIGHT:
          return 'right';
        case KeyEvent.DOM_VK_DOWN:
          return 'down';
        case KeyEvent.DOM_VK_LEFT:
          return 'left';
        case KeyEvent.DOM_VK_RETURN:
          return 'enter';
        case KeyEvent.DOM_VK_ESCAPE:
          return 'esc';
        case KeyEvent.DOM_VK_BACK_SPACE:
          return 'esc';
        default:// we don't consume other keys.
          return null;
      }
    },

    getNavigateElements: function() {
      var elements = [];
      this.navigableIds.forEach(function(id) {
        var elem = document.getElementById(id);
        if (elem) {
          elements.push(elem);
        }
      });
      this.navigableClasses.forEach(function(className) {
        var elems = document.getElementsByClassName(className);
        if (elems.length) {
          // Change HTMLCollection to array before concatenating
          elements = elements.concat(Array.prototype.slice.call(elems));
        }
      });
      elements = elements.concat(this.navigableScrollable);
      return elements;
    },

    handleFocus: function(elem) {
      if (elem.CLASS_NAME == 'XScrollable') {
        elem.cardNavigator.focus(elem.cardNavigator.getFocusedElement());
      } else if (elem.nodeName) {
        this.selectionBorder.select(elem);
      } else {
        this.selectionBorder.selectRect(elem);
      }
    },

    handleScrollableItemFocus: function(scrollable, elem) {
      this.selectionBorder.select(elem, scrollable.getItemRect(elem));
    }
  };

  exports.Home = Home;
}(window));

window.home = new Home();
window.home.init();

var addedItems = [];
setInterval(function() {
  var added = home.cardScrollable.getItemView();
  added.querySelector('.card-description').textContent = addedItems.length;
  addedItems.push(added);
  console.log(home.cardScrollable.addItem(added));
}, 1000);

setInterval(function() {
  console.log(home.cardScrollable.removeItem(addedItems.splice(0, 1)[0]));
}, 5000);