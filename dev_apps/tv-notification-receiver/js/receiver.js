/* global IACHandler, NotificationHelper */
'use strict';

(function(exports) {
  var Receiver = function Receiver() {
  };

  Receiver.prototype = {

    _session: undefined,

    start: function() {
      if (navigator.presentation) {
        console.log('Hook onpresent');
        navigator.presentation.onpresent = this.onPresent.bind(this);
      }
    },

    stop: function() {
      if (navigator.presentation) {
        navigator.presentation.onpresent = undefined;
      }
      if (this._session) {
        this._session.onmessage = undefined;
        this._session.onstatechange = undefined;
      }
      this._session = undefined;
    },

    onPresent: function(evt) {
      console.log('Got present event! ');
      this._session = evt.session;
      this._session.onmessage = this.onMessage.bind(this);
      this._session.onstatechange = this.onStateChangeProxy;
    },

    onMessage: function(message) {
      console.log('Got message: ' + message);
      // send notification anyhow
      navigator.mozApps.getSelf().onsuccess = function (evt) {
        var app = evt.target.result;
        var iconURL = NotificationHelper.getIconURI(app);
        new Notification(message, {body: message, icon: iconURL});
      };
    },

    onStateChangeProxy: function() {
      if(exports.receiver) {
        exports.receiver.onStateChange(this.state);
      }
    },

    onStateChange: function(state) {
      console.log('session state change to ' + state);

    }
  };

  exports.Receiver = Receiver;

  // self init
  exports.receiver = new Receiver();
  exports.receiver.start();
}(window));