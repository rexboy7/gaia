var pc_config = {'iceServers':[{'url':'stun:23.21.150.121'}]}
var pc_constraints = {
  'optional': [
    {'RtpDataChannels': true}
  ]};

var PresenterAdapter = {
  pc: new RTCPeerConnection(pc_config, pc_constraints),
  dc: null,
  parent: null,
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
    switch(message.event) {
      case 'initpresent':
        this.parent = evt.source;
        console.log(this.parent);
        this.id = message.id;
        this._sendOffer();
        break;
      case 'presentanswer':
        this.pc.setRemoteDescription(new RTCSessionDescription(message.data));
        break;
    };
  },
  _sendOffer: function pc_sendOffer() {
    this._onDataChannel({channel: this.pc.createDataChannel('present')});
    this.pc.createOffer(function(offer) {
      this.parent.postMessage({event: 'presentoffer', data: offer.toJSON(), id: this.id}, '*');
      this.pc.setLocalDescription(offer);
    }.bind(this)  , error);
  },
  _onDataChannel: function pc_onDataChannel(evt) {
    console.log("dtc");
    this.dc = evt.channel;
    this.dc.onmessage = this._onDataChannelReceive.bind(this);
    this.dc.onopen = this._onDataChannelOpened.bind(this);
    console.log("presenter._onDataChannel");
    // TODO: call onpresent and send session object to it
  },
  _onDataChannelReceive: function pc_onDataChannelReceive(evt) {
    console.log("dtcr");
    this.log(evt.data);
  },
  _onDataChannelOpened: function pc_onDataChannelOpened(evt) {
    this.dc.send("I'm presenter");
  },
  log: function pc_log(message) {
    var div = document.createElement('div');
    div.textContent = message;
    document.body.appendChild(div);
  }
}

PresenterAdapter.init();