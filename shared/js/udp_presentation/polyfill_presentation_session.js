(function(exports) {
'use strict';

function log(msg) {
  console.log('PresentationSession: ' + msg);
}

function PresentationSession() {
  this._currentstate = 'disconnected';
  window.addEventListener('message', (function sessionClose(evt) {
    var msg = evt.data;
    if (!msg.type || msg.type !== 'sessionClose' || msg.channelId !== this._remoteId) {
      return;
    }

    log('recv sessionClose');
    if (this.state === 'connected') {
      this._currentstate = 'disconnected';
      this._channelId = null;
      this._remoteId = null;
      this._emit('statechange');
    }
  }).bind(this));
}

PresentationSession.prototype = {
  get state() {
    return this._currentstate;
  },
  postMessage: function ps_postMessage(message) {
    if (!this._remoteId || !this.state === 'connected') {
      return;
    }
    navigator.sessionSend(this._remoteId, JSON.stringify(message));
  },
  close: function ps_close() {
    log('close session');
    if (this.state === 'connected') {
      navigator.sessionClose(this._channelId, this._remoteId);
      this._currentstate = 'disconnected';
      this._channelId = null;
      this._remoteId = null;
      this._emit('statechange');
    }
  },

  // procedure for primary screen
  initPrimary: function(url) {
    log('initPrimary: ' + url);
    var offer = this._createOffer();
    this._channelId = offer;
    this._sendOffer(url, offer);
  },
  _createOffer: function() {
    return navigator.createOffer();
  },
  _sendOffer: function(url, offer) {
    log('send offer: ' + offer);
    navigator.requestSession(url, offer);
    var self = this;
    window.addEventListener('message', function requestSession_Return(evt) {
      var msg = evt.data;
      if (!msg.type || msg.type !== 'requestSession:Return') {
        return;
      }
      log('receive requestSession:Return');
      window.removeEventListener('message', requestSession_Return);
      self._remoteId = msg.answer;
      window.addEventListener('message', self._onData.bind(self));
      self._currentstate = 'connected';
      self._emit('statechange');
    });
  },

  // procedure for secondary screen
  initSecondary: function(offer) {
    log('initSecondary: ' + offer);
    this._remoteId = offer;
    var answer = navigator.createAnswer();
    this._channelId = answer;
    navigator.responseSession(answer);
    window.addEventListener('message', this._onData.bind(this));
    this._currentstate = 'connected';
    this._emit('statechange');
  },

  _onData: function(evt){
    var msg = evt.data;
    if (!msg.type || msg.type !== 'ondata' || msg.channelId !== this._channelId) {
      return;
    }

    if (this.state !== 'connected') {
      log('receive message in wrong state');
      return;
    }
    log('receive message from remote: ' + msg.message);
    this._emit('message', JSON.parse(msg.message));
  },

  _emit: function ps_emit(eventname, data) {
    var cbname = 'on' + eventname;
    if (typeof this[cbname] == 'function' ) {
      setTimeout(this[cbname].bind(null, data), 0);
    }
  },
};

exports.PresentationSession = PresentationSession;

})(window);
