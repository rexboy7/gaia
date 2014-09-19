/* global IACHandler, NotificationHelper */
'use strict';

(function(exports) {
  var Receiver = function Receiver() {
  };

  Receiver.prototype = {

    _TYPES: {
      'start-ringing': {
        title: 'Incoming call',
        bodyTemplate: '__SENDER__ calling'
      },
      'stop-ringing': {
        title: 'Call ended',
        bodyTemplate: '__SENDER__ call ended'
      },
      'sms': {
        title: 'Message received',
        bodyTemplate: '__SENDER__: __MESSAGE__'
      }
      // TODO: mms
    },

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

    _isKnownType: function(type) {
      return !!this._TYPES[type];
    },

    _renderMessageBody: function(message) {
      var bodyTemplate = this._TYPES[message.type].bodyTemplate;
      var body;
      var sender;
      if (message.name) {
        sender = message.name;
      } else {
        sender = message.call;
      }
      switch(message.type) {
        case 'start-ringing':
        case 'stop-ringing':
          body = bodyTemplate.replace('__SENDER__', sender);
          break;
        case 'sms':
          body = bodyTemplate.replace('__SENDER__', sender)
                  .replace('__MESSAGE__', message.body);
          break;
        // TODO: mms
      }
      return body;
    },

    // possible message value:
    // 1. {"call":"0988682883","type":"start-ringing"}
    // 2. {"call":"0988682883","type":"stop-ringing"}
    // 3. {"call":"+886988682883","name":null,"type":"sms","body":"Test"}
    //
    // Currently http://webscreens.github.io/presentation-api/ did not define
    // the type of first arguement of onmessage(Should it be string or object?).
    // But we treat it as object for now.
    onMessage: function(message) {
      var that = this;
      var type = message.type;
      var title;
      var body;
      console.log('Got message(' + message.type + '): ' + message);
      if (this._isKnownType(type)) {
        title = this._TYPES[type].title;
        navigator.mozApps.getSelf().onsuccess = function (evt) {
          var app = evt.target.result;
          var iconURL = NotificationHelper.getIconURI(app);
          new Notification(title, {
            body: that._renderMessageBody(message), icon: iconURL
          });
        };
      }
    },

    onStateChangeProxy: function() {
      if(exports.receiver) {
        exports.receiver.onStateChange(this.state);
      }
    },

    onStateChange: function(state) {
      console.log('session state change to [' + state + ']');
      if (state === 'disconnected') {
        console.log('Stop receiver and close itself');
        this.stop();
        window.close();
      }
    }
  };

  exports.Receiver = Receiver;

  // self init
  exports.receiver = new Receiver();
  exports.receiver.start();
}(window));