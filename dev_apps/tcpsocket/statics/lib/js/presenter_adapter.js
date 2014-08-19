var pc_config = {'iceServers':[{'url':'stun:23.21.150.121'}]}
var pc_constraints = {
  'optional': [
    {'RtpDataChannels': true}
  ]};

var PresenterAdapter = {
  pc: new RTCPeerConnection(pc_config, pc_constraints),
  dc: null,
  parent: null,
  session: null,
  init: function pc_init() {
    window.addEventListener('message', this._handleMessage.bind(this));
    // Presenter side:
    // PostMessage(to "system app")
    // add event listener on response
    // make Offer SDP
    // set local SDP
    // send SDP through system app, 'onpresentoffer'
    // add "onpresentanswer" from system app
    // got SDP from "onpresentanswer" event
    // ===========================
    // Server side:
    // add event listener for "onpresentoffer"
    // on "onpresentoffer", send SDP to client
    // add "onpresentanswer" event
    // pass SDP to presenter by "onpresentanswer"
    // ===========================
    // Client side:
    // add event listener for "onpresentoffer"
    // on "onpresentoffer", set remote SDP
    // make Answer SDP
    // send SDP to Server side, "onpresentanswer"
  },
  _handleMessage: function pc_handleMessage(evt) {
    var message = evt.data;
    if (!message) {
      return;
    }
    console.log("SIGNALING_EVT" + message.event);
    switch(message.event) {
      case 'initpresent':
        console.log(this.parent);
        SecondarySessionSignaler.parent = this.parent = evt.source;
        this.session = new PresentationSession(SecondarySessionSignaler);
        this.session.id = message.id;
        this.session._sendOffer();
        break;
      case 'presentanswer':
        this.session._receiveAnswer(message);
        break;
    };
  },

  log: function pc_log(message) {
    var div = document.createElement('div');
    div.textContent = message;
    document.body.appendChild(div);
  }
};

var Presentation = {
  onpresent: null,
  log: PresenterAdapter.log
};

var SecondarySessionSignaler = {
  parent: null,
  send: function sss_sendMessage(event, data, id) {
    parent.postMessage({event: event, data: data, id: id}, '*');
  },
  onpresent: function sss_onpresent(evt) {
    Presentation.onpresent(evt);
  }
};

PresenterAdapter.init();