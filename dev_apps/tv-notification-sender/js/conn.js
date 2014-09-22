
(function(exports) {
  'use strict';

  var RECEIVER_APP_URL = 'app://tv-notification-receiver.gaiamobile.org/index.html';

  exports.Connection = {
    _events: {},
    _queued: [],
    _availabled: false,

    init: function init(telephony) {
      var self = this;
      navigator.presentation.onavailablechange = function(data) {
        console.log('onavailablechange: ' + data.available);
        self._availabled = data.available;
        if (self._availabled && self._queued.length) {
          self._requestSession();
        }
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
        if (!this._availabled || !this.session ||
                 this.session.state !== 'connected') {
        this._queued[this._queued.length] = msg;
        this._requestSession();
        return;
      }
      this.session.postMessage(msg);
    },

    _requestSession: function _requestSession() {
      if (!this._availabled || this.session) {
        // if we have session, we should wait for onstatechange fired.
        console.log('not available or wait session ready: ' +
                    this._availabled);
        return;
      }
      var self = this;
      this.session = navigator.presentation.requestSession(RECEIVER_APP_URL);
      console.log('initial session state: ' + this.session.state);
      function flashQueue() {
        console.log('session state changed: ' + self.session.state);
        if (self.session.state === 'connected') {
          var queued = self._queued;
          self._queued = [];
          for (var i = 0; i < queued.length; i++) {
            self.session.postMessage(queued[i]);
          }  
        } else {
          console.log('session disconnected');
          self.session = null;
        }
      }
      this.session.onstatechange = flashQueue;

      if (self.session.state === 'connected') {
        console.log('got a connected session');
        flashQueue();
      }

      this.session.onmessage = function(msg) {
        self._fire('message', msg);
      };
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
