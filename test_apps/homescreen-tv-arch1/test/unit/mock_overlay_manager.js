'use strict';

(function(exports) {
  exports.MockOverlayManager = {
    reset: function() {},
    readyToOpen: function(type, callback) {
      callback();
    },
    afterClosed: function() {},
    hasOverlay: function() {}
  };
})(window);
