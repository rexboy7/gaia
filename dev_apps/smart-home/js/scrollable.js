'use strict';

(function(exports) {

  function XScrollable(frameElem, listElem) {
    this.translateX = 0;
    this.scrollEdgeOffset = 20;
    this.frameElem = (typeof frameElem == 'string') ?
                          document.getElementById(frameElem) : frameElem;
    this.listElem = (typeof listElem == 'string') ?
                          document.getElementById(listElem) : frameElem;
  }

  XScrollable.prototype = {
    getItemRect: function(elem) {
      var frameRect = this.frameElem.getBoundingClientRect();
      return {
        left: frameRect.left + elem.offsetLeft + this.translateX,
        top: frameRect.top + elem.offsetTop,
        width: elem.offsetWidth,
        height: elem.offsetHeight
      };
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
        sibling = this.getPrevItem(elem);
        if (sibling) {
          return -(sibling.offsetLeft + 0.5 * sibling.offsetWidth);
        } else {
          return -(elem.offsetLeft - this.scrollEdgeOffset);
        }
      } else if (offsetRight > (frameWidth - this.translateX)) {
        sibling = this.getNextItem(elem);
        if (sibling) {
          return frameWidth - (sibling.offsetLeft + 0.5 * sibling.offsetWidth);
        } else {
          return frameWidth - (offsetRight + this.scrollEdgeOffset);
        }
      } else {
        return this.translateX;
      }
    },

    getNextItem: function(elem) {
      var iter = elem;
      while (iter.parentElement != this.listElem) {
        iter = iter.parentElement;
      }
      return iter.nextElementSibling ?
        iter.nextElementSibling.getElementsByClassName(elem.className)[0] :
        null;
    },

    getPrevItem: function(elem) {
      var iter = elem;
      while (iter.parentElement != this.listElem) {
        iter = iter.parentElement;
      }
      return iter.previousElementSibling ?
        iter.previousElementSibling.getElementsByClassName(elem.className)[0] :
        null;
    }
  };
  exports.XScrollable = XScrollable;
})(window);
