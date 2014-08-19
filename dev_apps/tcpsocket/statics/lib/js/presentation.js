'use strict';

var Presentation = {
  channelPeer: PureHTTPPeer,
  sessions: {},

  init: function() {
    this.channelPeer.init();
    this.channelPeer.onDataChannelOpened = this.onDataChannelOpened.bind(this);
    this.channelPeer.onDataChannelReceive = this.onDataChannelReceive.bind(this);
  },
  onDataChannelOpened: function pr_onRemoteJoin() {
    this.onavailablechange && this.onavailablechange({available: true});
  },
  // TODO: implement onRemoteLeave, check if remote server exists.
  requestSession: function pr_requestSession(url) {
    if (!url) {
      return;
    }
    console.log("REQUESTSESSION");
    var session = new PresentationSession(PrimarySessionSignaler);
    session.request(url);
    this.sessions[url] = session;
    //this.presentataionSession = new PresentationSession(url);
    return session;
  },
  onDataChannelReceive: function p_onDataChannelReceive(message) {
    console.log("EXPECT:PRESENTOFFER");
    switch(message.event) {
      case 'presentoffer':
        this.sessions[message.id]._sendAnswer(message.data);
        break;
    }
  },
  log: function p_log(message) {
    this.channelPeer.log(message);
  },
  ///////////////////////////////////////////////////////////
  onavailablechange: null,
  onpresent: null
};

var PrimarySessionSignaler = {
  send: function pss_sendMessage(event, data, id) {
    Presentation.channelPeer.dataChannelSend('presentanswer', data, id);
  },
  onpresent: function pss_onopened() {}
};

Presentation.init();


