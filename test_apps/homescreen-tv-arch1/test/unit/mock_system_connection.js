'use strict';
(function(exports) {
  var uuid = 0;
  var MockSystemConnection = {
    callbacks: {
      'addWidget': {},
      'removeWidget': {},
      'updateWidget': {},
      'showAll': {},
      'hideAll': {}
    },
    addWidget: function sc_addWidget(args, callback) {
      var id = uuid++;
      this.callbacks.addWidget[id] = callback;
      return id;
    },
    removeWidget: function sc_removeWidget(args, callback) {
      var id = uuid++;
      this.callbacks.removeWidget[id] = callback;
      return id;
    },
    updateWidget: function sc_updateWidget(args, callback) {
      var id = uuid++;
      this.callbacks.updateWidget[id] = callback;
      return id;
    },
    showAll: function sc_showAll(callback) {
      var id = uuid++;
      this.callbacks.showAll[id] = callback;
      return id;
    },
    hideAll: function sc_hideAll(callback) {
      var id = uuid++;
      this.callbacks.hideAll[id] = callback;
      return id;
    },
    mTeardown: function sc_mTeardown() {
      this.callbacks = {
        'addWidget': {},
        'removeWidget': {},
        'updateWidget': {},
        'showAll': {},
        'hideAll': {}
      };
    }
  };
  exports.MockSystemConnection = MockSystemConnection;
}(window));
