'use strict';
(function(exports) {

  function MockWidgetManager(options) {
    MockWidgetManager.singleton._options = options;
    return MockWidgetManager.singleton;
  }

  MockWidgetManager.singleton = {
    on: function() {},
    off: function() {},
    start: function() {},
    stop: function() {},
    syncWidgets: function() {},
    save: function() {},
    reset: function() {}
  };

  MockWidgetManager.mTeardown = MockWidgetManager.singleton.reset;
  exports.MockWidgetManager = MockWidgetManager;
})(window);
