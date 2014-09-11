/* global Contacts, Connection */

(function(exports) {
  'use strict';
  exports.CallSender = {
    handledCalls: [],
    init: function init(telephony) {
      var self = this;
      this._telephony = telephony;
      window.navigator.mozSetMessageHandler('telephony-new-call', function() {
        telephony.oncallschanged = self.handleEvent.bind(self);
      });
      window.navigator.mozSetMessageHandler('telephony-call-end', function() {
        telephony.oncallschanged = self.handleEvent.bind(self);
      });
    },

    uninit: function uninit(telephony) {
    },

    handleEvent: function handleEvent(data) {
      this.handleCalls(this._telephony.calls);
      this.removeDisconnectedCalls();
    },

    handleCalls: function handleCalls(calls) {
      var self = this;
      var incoming = calls.filter(function(call) {
        return call.state === 'incoming';
      });
      for (var i = 0; i < incoming.length; i++) {
        var call = incoming[i];
        var handled = this.handledCalls.find(function(handled) {
          return handled.call === call;
        });
        if (!handled) {
          this.queryContact(call, function(number, name) {
            // we need to remove notification when user pick this call.
            call.addEventListener('statechange', self);
            self.handledCalls.push({
              'call': call,
              'name': name // name may be undefined.
            });
            Connection.postMessage({
              'call': number,
              'name': name,
              'type': 'start-ringing'
            });
          });
        }
      }
    },

    getCallNumber: function getCallNumber(call) {
      return call.id ? (call.secondId ? call.secondId.number : call.id.number):
                       (call.secondNumber ? call.secondNumber : call.number)
    },

    queryContact: function queryContact(call, callback) {
      var number = this.getCallNumber(call);

      Contacts.findByNumber(number,
                            function lookupContact(contact, matchingTel) {
        if (contact && contact.name) {
          callback(number, contact.name[0]);
        } else {
          callback(number);
        }
      });
    },

    removeDisconnectedCalls: function removeDisconnectedCalls() {
      for (var i = 0; i < this.handledCalls.length; i++) {
        var handled = this.handledCalls[i];
        if (handled.call.state !== 'incoming') {
          var number = this.getCallNumber(handled.call);
          console.log('!!!! not ringing from:' + number);
          Connection.postMessage({
            'call': number,
            'name': handled.name,
            'type': 'stop-ringing'
          });
          this.handledCalls.splice(i, 1);
          i--;
        }
      }
    }
  };
})(window);
