'use strict';

var Presentation = {
  __proto__: TCPSocketPeer,
  init: function() {
    TCPSocketPeer.init.apply(this);
    this.presentationSession = new PresentationSession();
  },
  onRemoteJoin: function pr_onRemoteJoin() {
    console.log("remotejoin");
    this.onavailablechange && this.onavailablechange({available: true});
  },
  requestSession: function pr_requestSession(url) {
    // Currently URL is not available.
    // this.sendOffer();

    return this.presentationSession;
  },
  onDataChannelOpened: function p_onDataChannelOpened(evt) {
    if (this.rank == 'host') {
      this.presentationSession.currentstate = 'connected';
      this.presentationSession.onstatechange &&
        this.presentationSession.onstatechange();
    } else {
      this.presentationSession = new PresentationSession();
      this.presentationSession.currentstate = 'connected';
      this.onpresent &&
        this.onpresent({session: this.presentationSession});
    }
  },
  onReceiveData: function p_onReceiveData(evt) {
    this.presentationSession.onmessage &&
      this.presentationSession.onmessage(evt.data);
  },
  ///////////////////////////////////////////////////////////
  onavailablechange: null,
  onpresent: null
}

function PresentationSession(url) {
  this._url = url;
}

PresentationSession.prototype = {
  get state() {
    return this.currentstate;
  },
  postMessage: function ps_postMessage(message) {
    Presentation.dc.send(message);
  },
  close: function ps_close() {

  },
  onmessage: null,
  onstatechange: null,
  _url: null
}

Presentation.init();


