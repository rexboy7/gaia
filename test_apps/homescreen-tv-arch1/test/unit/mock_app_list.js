'use strict';

(function(exports) {

  function MockAppList(options) {
    MockAppList.singleton._options = options;
    return MockAppList.singleton;
  }

  MockAppList.singleton = {
    on: function() {},
    off: function() {},
    init: function() {},
    uninit: function() {},
    show: function() {
      this.shown = true;
    },
    hide: function() {
      this.shown = false;
    },
    isShown: function() {
      return this.shown;
    },
    handleKeyDown: function(key) {
      if (key === 'Esc') {
        this.hide();
      }
    },
    reset: function() {}
  };

  MockAppList.mTeardown = MockAppList.singleton.reset;
  exports.MockAppList = MockAppList;
})(window);
