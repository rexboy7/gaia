'use strict';

var Presentation = {
  __proto__: PureHTTPPeer,
  sessions: {},
  init: function() {
    PureHTTPPeer.init.apply(this);
  },
  onDataChannelOpened: function pr_onRemoteJoin() {
    this.onavailablechange && this.onavailablechange({available: true});
  },
  // TODO: implement onRemoteLeave, check if remote server exists.
  requestSession: function pr_requestSession(url) {
    if (!url) {
      return;
    }
    this.sessions[url] = new PresentationSession(url);
    //this.presentataionSession = new PresentationSession(url);
    return this.sessions[url];
  },
  /*
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
  },*/
  onDataChannelReceive: function p_onDataChannelReceive(message) {
    switch(message.event) {
      case 'presentoffer':
        this.sessions[message.id]._sendAnswer(message.data);
    }
    //this.presentationSession.onmessage &&
      //this.presentationSession.onmessage(evt.data);
  },
  ///////////////////////////////////////////////////////////
  onavailablechange: null,
  onpresent: null
};

function PresentationSession(url) {
  Presentation.dataChannelSend('opensession', url);
  this._url = url;
  this.id = url;
  this._currentstate = 'disconnected';
}

PresentationSession.prototype = {
  pc: null,
  get state() {
    return this._currentstate;
  },
  postMessage: function ps_postMessage(message) {
    this.dc.send(JSON.stringify(message));
  },
  close: function ps_close() {

  },
  _sendAnswer: function ps_sendAnswer(offer) {
    this.pc = new RTCPeerConnection(pc_config, pc_constraints);
    this.pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
      this.pc.createAnswer(function(answer) {
        this.pc.setLocalDescription(answer);
        Presentation.dataChannelSend('presentanswer', answer, this.id);
      }.bind(this), error);
    }.bind(this), error);
    this.pc.ondatachannel = this.onDataChannel.bind(this);
  },
  onDataChannel: function ps_onDataChannel(evt) {
    console.log("Ondatachannel");
    this.dc = evt.channel;
    this.dc.onmessage = this.onDataChannelReceive.bind(this);
    this.dc.onopen = this.onDataChannelOpened.bind(this);

    this.currentstate = 'connected';
    this.onstatechange && this.onstatechange();
  },
  onDataChannelOpened: function ps_onDataChannelOpened(evt) {
    this.postMessage("I'm Client");
  },
  onDataChannelReceive: function ps_onDataChannelReceive(evt){
    Presentation.log(evt.data);
  },

  onmessage: null,
  onstatechange: null,
  _url: null
};

Presentation.init();


