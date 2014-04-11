'use strict';

(function(exports) {

  function MockSpatialNavigator(collection, func) {
    MockSpatialNavigator.singleton._collection = collection || [];
    return MockSpatialNavigator.singleton;
  }

  MockSpatialNavigator.singleton = {
    _focused: null,
    focus: function(elm) {
      this._focused = elm || this._collection[0];
    },
    refocus: function() {},
    on: function() {},
    off: function() {},
    add: function(elm) {
      this._collection.push(elm);
    },
    move: function() {},
    remove: function(elm) {
      var idx = this._collection.indexOf(elm);
      if (idx > -1) {
        this._collection.splice(idx, 1);
      }
    },
    currentFocus: function() {
      return this._focused;
    },
    reset: function() {
      this._focused = null;
      this._collection = null;
    }
  };

  MockSpatialNavigator.mTeardown = MockSpatialNavigator.singleton.reset;
  exports.MockSpatialNavigator = MockSpatialNavigator;
})(window);
