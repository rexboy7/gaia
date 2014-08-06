'use strict';

function error(e) {
  throw e;
}
var socket = io.connect();
var pc_config = webrtcDetectedBrowser === 'firefox' ?
  {'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
  {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
var pc_constraints = {
  'optional': [
    {'RtpDataChannels': true}
  ]};

var Peer = {
  rank: null, // 'host' or 'guest'
  pc: new RTCPeerConnection(pc_config, pc_constraints),
  dc: null,
  init: function p_init() {
    socket.on('created', this.onRoomCreated.bind(this));
    socket.on('join', this.onRemoteJoin.bind(this));
    socket.on('joined', this.onSelfJoined.bind(this));
    socket.on('offer', this.gotRemoteOffer.bind(this));
    socket.on('answer', this.gotRemoteAnswer.bind(this));
    socket.on('log', this.log.bind(this));
    this.connectRoom('123');
  },
  connectRoom: function p_connectRoom(room) {
    socket.emit('create or join', room);
  },
  onRoomCreated: function p_onRoomCreated() {
    this.log('room created');
    this.rank = 'host';
  },
  onRemoteJoin: function p_onRemoteJoin() {
    this.log('remote peer joined the room');
  },
  onSelfJoined: function p_onSelfJoined() {
    this.log('joined an existed room');
    this.rank = 'guest';
    //this.sendOffer();
  },
  sendOffer: function p_sendOffer() {
    this.onDataChannel({channel: this.pc.createDataChannel("myc")});
    this.pc.createOffer(function(offer) {
      this.pc.setLocalDescription(offer);
      socket.emit('putOffer', offer);
    }.bind(this), error);
  },
  gotRemoteOffer: function p_gotRemoteOffer(offer) {
    if (this.rank == 'host') {
      return;
    }
    this.pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
      this.pc.createAnswer(function(answer) {
        this.pc.setLocalDescription(answer);
        socket.emit('putAnswer', answer);
      }.bind(this), error);
    }.bind(this), error);
    this.pc.ondatachannel = this.onDataChannel.bind(this);
  },
  onDataChannel: function p_onDataChannel(evt) {
    this.dc = evt.channel;
    this.dc.onmessage = this.onReceiveData.bind(this);
    this.dc.onopen = this.onDataChannelOpened.bind(this);
  },
  onDataChannelOpened: function p_onDataChannelOpened(ev) {
    this.dc.send("Hello this is " + this.rank + " speaking");
  },
  onReceiveData: function p_onReceiveData(evt) {
    this.log(evt.data);
  },
  gotRemoteAnswer: function p_gotRemoteAnswer(answer) {
    if (this.rank == 'guest') {
      return;
    }
    this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  },
  send: function p_send(type, data) {
    this.dc.send({
      type: type,
      data: data
    });
  },
  log: function p_log(message) {
    var div = document.createElement('div');
    div.textContent = message;
    document.body.appendChild(div);
  }
};