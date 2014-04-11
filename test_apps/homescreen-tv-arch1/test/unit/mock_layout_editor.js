'use strict';

(function(exports) {

  function MockLayoutEditor(options) {
    MockLayoutEditor.singleton._options = options;
    return MockLayoutEditor.singleton;
  }

  MockLayoutEditor.singleton = {
    placeHolders: [
      {static: true, elm: {}},
      {static: true, elm: {}},
      {elm: {}},
      {elm: {}},
      {elm: {}},
      {elm: {}}
    ],
    init: function() {
    },
    uninit: function() {
    },
    reset: function() {
    },
    getFirstNonStatic: function() {
    },
    exportConfig: function() {
    },
    addWidget: function() {
    },
    loadWidget: function() {
    },
    removeWidget: function() {
    },
    removeWidgets: function() {
    },
    updateWidgets: function() {
    },
    mTeardown: function() {
      this.placeHolders = [];
    }
  };

  MockLayoutEditor.mTeardown = MockLayoutEditor.singleton.mTeardown;
  exports.MockLayoutEditor = MockLayoutEditor;
})(window);
