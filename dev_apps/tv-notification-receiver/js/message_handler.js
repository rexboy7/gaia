'use strict';

(function(exports) {
  var MessageHandler = function MessageHandler() {
    // This module actually do nothing, just to notify that message_handler.html
    // is brought up.

    // Currently, message_handler.js is embedded in message_handler.html.
    // This is because we need one page (message_handler.html, more or less
    // equivlent to /statics/secondary_host/index.html in
    // https://github.com/rexboy7/presentation_api_polyfill) to setup webRTC
    // connection before using Presentation API polyfill.

    // Once we finished discovery mechanism in Gecko, we could remove
    // message_handler.html
  };

  MessageHandler.prototype = {
    BRINGUP_EVENT_NAME: 'iac-tv-notification-bringup',

    start: function mh_start() {
      window.addEventListener(this.BRINGUP_EVENT_NAME, this);
    },
    stop: function mh_stop() {
      window.removeEventListener(this.BRINGUP_EVENT_NAME, this);
    },
    handleEvent: function mh_handleEvent(evt) {
      console.log('got iac-tv-notification-bringup event');
    }
  };

  exports.messageHandler = new MessageHandler();
  // self init
  exports.messageHandler.start();
}(window));