(function(exports) {
'use strict';

function log(message) {
  console.log('Presentation: ' + message);
}

var PolyFillPrimary = {
  sessions: {},

  init: function() {
    //TODO: hook to addon
    window.addEventListener('message', (function(evt) {
      var msg = evt.data;
      log('receive message from UA: ' + JSON.stringify(msg));
      if (!msg.type || (msg.type !== 'device-available' && msg.type !== 'requestSession')) {
        return;
      }

      switch (msg.type) {
        case 'device-available':
          this._fireEvent('availablechange', {available: msg.available});
          break;
        case 'requestSession':
          var session = new PresentationSession();
          session.initSecondary(msg.offer);
          this._fireEvent('present', {session: session});
          break;
      }
    }).bind(this));
    navigator.peekDevice();
  },

  requestSession: function pr_requestSession(url) {
    if (!url) {
      return;
    }
    log('request session for ' + url);
    var baseURL = location.origin + location.pathname.slice(0, location.pathname.lastIndexOf('/'));
    var fullURL = (new URL(url, baseURL)).toString();
    var session = new PresentationSession();
    session.initPrimary(fullURL);
    this.sessions[url] = session;
    return session;
  },

  _fireEvent: function(type, data) {
    log('fire event (' + type + '): ' + JSON.stringify(data));
    var cbname = 'on' + type;
    if (typeof this[cbname] == 'function' ) {
      this[cbname](data);
    }
  },

  ///////////////////////////////////////////////////////////
  onavailablechange: null,
  onpresent: null,
};

window.addEventListener('load', function() {
  PolyFillPrimary.init();
});

exports.navigator.presentation = PolyFillPrimary;

})(window);
