var pc_config = {'iceServers':[{'url':'stun:23.21.150.121'}]}
var pc_constraints = {
  'optional': [
    {'RtpDataChannels': true}
  ]};
var serverURL = '127.0.0.1';
function error(e) {
  throw e;
}

var TCPSocketPeer = {
  rank: null, // 'host' or 'guest'
  pc: new RTCPeerConnection(pc_config, pc_constraints),
  dc: null,
  socket: null,
  init: function p_init() {
    this.socket = navigator.mozTCPSocket.open('127.0.0.1', 8105);
    this.socket.onopen = this.onopen.bind(this);
    this.socket.ondata = this.ondata.bind(this);
    this.socket.onclose = this.onclose.bind(this);
  },
  onopen: function p_onopen() {
    console.log("opened");
  },
  ondata: function p_ondata(evt) {
    var message = JSON.parse(evt.data);
    if (!message || !message.event) {
      return;
    }
    console.log(message);

    switch (message.event) {
      case 'created':
        this.rank = 'host';
        break;
      case 'joined':
        this.rank = 'guest';
        this.sendOffer();
        break;
      case 'memberadded':
        // Other members joined
        console.log(this);
        this.onRemoteJoin && this.onRemoteJoin();
        break;
      case 'memberleft':
        // TODO: determine room host also when previous host left.
        if(message.data == 1) {
          this.rank = 'host';
          this.log('No other members left. becoming host');
        }
        break;
      case 'log':
        this.log(message.data);
        break;
      case 'offer':
        this.gotRemoteOffer(message.data);
        break;
      case 'answer':
        this.gotRemoteAnswer(message.data);
    }
  },
  onclose: function p_onclose() {

  },
/////////////////////////////////////
  sendOffer: function p_sendOffer() {
    console.log(this.rank + ":sendoffer");
    // create Data channel and set receiver for it
    // (we call onDataChannel manually since it's only triggered on answer side)
    this.onDataChannel({channel: this.pc.createDataChannel("myc")});
    this.pc.createOffer(function(offer) {
      this.pc.setLocalDescription(offer);
      this.serializeSend({
        event: 'offer',
        data: offer
      });
    }.bind(this), error);
  },
  serializeSend: function p_serializeSend(message) {
    console.log(message);
    this.socket.send(JSON.stringify(message));
  },
  gotRemoteOffer: function p_gotRemoteOffer(offer) {
    console.log(this.rank + ":gotremoteoffer");
    if (this.rank == 'guest') {
      return;
    }
    this.pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
      this.pc.createAnswer(function(answer) {
        this.pc.setLocalDescription(answer);
        this.serializeSend({
          event: 'answer',
          data: answer
        });
      }.bind(this), error);
    }.bind(this), error);
    this.pc.ondatachannel = this.onDataChannel.bind(this);
  },
  gotRemoteAnswer: function p_gotRemoteAnswer(answer) {
    console.log(this.rank + ":gotremoteanswer");
    if (this.rank == 'host') {
      return;
    }
    this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  },

  //////
  onDataChannel: function p_onDataChannel(evt) {
    console.log(this.rank + ":ondatachannel");
    this.dc = evt.channel;
    this.dc.onmessage = this.onReceiveData.bind(this);
    this.dc.onopen = this.onDataChannelOpened.bind(this);
  },
  onDataChannelOpened: function p_onDataChannelOpened(ev) {
    console.log("ondatachannelopened");
    this.dc.send("Hello this is " + this.rank + " speaking");
  },
  onReceiveData: function p_onReceiveData(evt) {
    console.log("onreceivedata");
    this.log(evt.data);
  },
  send: function p_send(type, data) {
    console.log("send");
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
}