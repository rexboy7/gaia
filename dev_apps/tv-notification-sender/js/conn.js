
(function(exports) {
  'use strict';

  var RECEIVER_APP_URL = '/statics/secondary_page/index.html';

  exports.Connection = {
    _events: {},
    _queued: [],

    init: function init(telephony) {
      var self = this;
      navigator.presentation.connectPeer();
      navigator.presentation.onavailablechange = function(e) {
        console.log('onavailablechange!!');
        self.session = navigator.presentation.requestSession(RECEIVER_APP_URL);
        function flashQueue() {
          var queued = self._queued;
          self._queued = [];
          for (var i = 0; i < queued.length; i++) {
            self.session.postMessage(queued[i]);
          }
        }
        self.session.onstatechange = flashQueue;

        if (self.session.state === 'connected') {
          console.log('got a connected session');
          flashQueue();
        }

        self.session.onmessage = function(msg) {
          self._fire('message', msg);
        };
      };
    },

    uninit: function uninit(telephony) {
      if (this.session) {
        this.session.close();
        this.session = null;
      }
    },

    addEventListener: function addListener(type, func) {
      if (!this._events[type]) {
        this._events[type] = [];
      }
      this._events[type].push(func);
    },

    removeEventListener: function removeListener(type, func) {
      if (!this._events[type] || this._events[type].indexOf(func) === -1) {
        return;
      }
      var listeners = this._events[type];
      listeners.splice(listeners.indexOf(func), 1);
      if (listeners.length === 0) {
        delete this._events[type];
      }
    },

    postMessage: function post(msg) {
      if (!this.session || this.session.state !== 'connected') {
        this._queued[this._queued.length] = msg;
        return;
      }
      this.session.postMessage(msg);
    },

    _fire: function _fire(type, data) {
      if (!this._events[type]) {
        return;
      }

      for (var i = this._events.length - 1; i >= 0; i--) {
        var listener = this._events[i];
        if ((typeof listener) === 'function') {
          listener(data);
        } else if ((typeof listener.handleEvent) === 'function') {
          listener.handleEvent(data);
        }
      };
    }
  };
})(window);
