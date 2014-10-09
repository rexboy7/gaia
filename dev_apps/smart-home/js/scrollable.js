'use strict';

/* global evt, CardNavigator */
(function(exports) {

  function XScrollable(frameElem, listElem, selections) {
    this.translateX = 0;
    this.scrollEdgeOffset = 20;
    this.frameElem = (typeof frameElem == 'string') ?
                          document.getElementById(frameElem) : frameElem;
    this.listElem = (typeof listElem == 'string') ?
                          document.getElementById(listElem) : frameElem;
    this.selections = Array.prototype.slice.call(
      (typeof selections == 'string') ?
                              document.getElementsByClassName(selections) :
                              Array.prototype.slice.call(selections));
    this.selectionClass =
            (typeof selections == 'string') ? selections : 'card-thumbnail';

    var defaultItem = this.listElem.dataset.defaultItem;
    this.cardNavigator = new CardNavigator(this.selections);
    this.cardNavigator.focus(this.selections.length > defaultItem ?
                                        this.selections[defaultItem] : null);
    this.cardNavigator.on('focus', this.handleSelection.bind(this));
  }

  XScrollable.prototype = evt({
    CLASS_NAME: 'XScrollable',
    getItemRect: function(elem) {
      var frameRect = this.frameElem.getBoundingClientRect();
      return {
        left: frameRect.left + elem.offsetLeft + this.translateX,
        top: frameRect.top + elem.offsetTop,
        width: elem.offsetWidth,
        height: elem.offsetHeight
      };
    },

    getBoundingClientRect: function() {
      return this.frameElem.getBoundingClientRect();
    },

    scrollTo: function(elem) {
      this.translateX = this._getScrollOffset(elem);
      this.listElem.style.transform =
                          'translateX(' + this.translateX + 'px)';
    },

    _getScrollOffset: function(elem) {
      var sibling;
      var offsetRight = elem.offsetLeft + elem.offsetWidth;
      var frameWidth = this.frameElem.offsetWidth;
      if (elem.offsetLeft + this.translateX <= 0) {
        sibling = this.getPrevSelection(elem);
        if (sibling) {
          return -(sibling.offsetLeft + 0.5 * sibling.offsetWidth);
        } else {
          return -(elem.offsetLeft - this.scrollEdgeOffset);
        }
      } else if (offsetRight > (frameWidth - this.translateX)) {
        sibling = this.getNextSelection(elem);
        if (sibling) {
          return frameWidth - (sibling.offsetLeft + 0.5 * sibling.offsetWidth);
        } else {
          return frameWidth - (offsetRight + this.scrollEdgeOffset);
        }
      } else {
        return this.translateX;
      }
    },

    getNextSelection: function(selection) {
      var iter = selection;
      while (iter.parentElement != this.listElem) {
        iter = iter.parentElement;
      }
      return iter.nextElementSibling ?
        iter.nextElementSibling.getElementsByClassName(selection.className)[0] :
        null;
    },

    getPrevSelection: function(selection) {
      var iter = selection;
      while (iter.parentElement != this.listElem) {
        iter = iter.parentElement;
      }
      return iter.previousElementSibling ?
        iter.previousElementSibling.
        getElementsByClassName(selection.className)[0] :
        null;
    },

    addItem: function(elem) {
      var selections = elem.getElementsByClassName(this.selectionClass);
      return (selections.length == 1) &&
             this.cardNavigator.add(selections[0]) &&
             !!this.listElem.appendChild(elem);
    },

    /* Override if needed */
    getItemView: function() {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = '<div class="' + this.selectionClass + '"></div>' +
                       '<div class="card-description">This is a card</div>';
      return card;
    },

    removeItem: function(elem) {
      var selections = elem.getElementsByClassName(this.selectionClass);
      var focus = this.cardNavigator.getFocusedElement();
      // TODO: select nearest item if focused item is removed.
      if (selections.length != 1) {
        return false;
      }
      var selection = selections[0];

      var newfocus = (focus == selection) ?
          this.getNextSelection(focus) || this.getPrevSelection(focus):
          focus;
      var success = this.cardNavigator.remove(selection) &&
          !!this.listElem.removeChild(elem);
      this.cardNavigator.focus(newfocus);
        return success;

    },

    insertItem: function(elem, index) {

    },

    handleSelection: function(elem) {
      this.scrollTo(elem);
      this.fire('focus', this, elem);
    }
  });
  exports.XScrollable = XScrollable;
})(window);
