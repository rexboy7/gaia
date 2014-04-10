'use strict';
(function(exports) {

  function MockWidgetEditor(options) {
    MockWidgetEditor.singleton._options = options;
    return MockWidgetEditor.singleton;
  }

  MockWidgetEditor.singleton = {
    on: function() {},
    off: function() {},
    start: function() {},
    stop: function() {},
    show: function() {
      this.shown = true;
    },
    hide: function() {
      this.shown = false;
    },
    isShown: function() {
      return this.shown;
    },
    importConfig: function() {},
    exportConfig: function() {
      return [];
    },
    handleKeyDown: function() {},
    togglePlace: function() {},
    switchFocus: function() {},
    reset: function() {}
  };

  MockWidgetEditor.mTeardown = MockWidgetEditor.singleton.reset;
  exports.MockWidgetEditor = MockWidgetEditor;
})(window);
