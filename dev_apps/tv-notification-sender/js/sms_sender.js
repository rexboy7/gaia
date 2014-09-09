/* global Connection */

(function(exports) {
  'use strict';

  exports.SMSSender = {
    init: function init() {
      window.navigator.mozSetMessageHandler('sms-received',
                                            this.onSMS.bind(this));
    },

    onSMS: function onSMS(message) {
      var number = message.sender;
      Contacts.findByNumber(number,
                            function lookupContact(contact, matchingTel) {

        Connection.postMessage({
          'call': number,
          'name': (contact && contact.name) ? contact.name : '[anonymous]',
          'type': (message.type === 'sms') ? 'sms' : 'mms',
          'body': (message.type === 'sms') ? message.body : null
        });
      });
    }
  };
})(window);
