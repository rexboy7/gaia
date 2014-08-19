var pc_config = {'iceServers':[{'url':'stun:23.21.150.121'}]}
var pc_constraints = {
  'optional': [
    {'RtpDataChannels': true}
  ]};
var serverURL = '127.0.0.1';
var serverPort = 8000;
function error(e) {
  throw e;
}

var PureHTTPPeer = {
  rank: rank, // 'host' or 'guest'
  pc: new RTCPeerConnection(pc_config, pc_constraints),
  dc: null,
  evtSrc: null,
  init: function php_init() {
    this.evtSrc = new EventSource(eventUrl);
    this.evtSrc.addEventListener('availablechange', this);
    this.evtSrc.addEventListener('icecandidate', this);
    this.evtSrc.addEventListener('requestsession', this);
    this.evtSrc.addEventListener('offer', this);
    this.evtSrc.addEventListener('answer', this);
    this.evtSrc.addEventListener('ping', this);
    this.evtSrc.onerror = error;
    this.evtSrc.onclose = this.onclose.bind(this);
    this.pc.onicecandidate = function (e) {
      if (e.candidate == null) {
        return;
      }
      this.serializeSend( {
        roomNum: roomNum,
        candidate: e.candidate,
        event: this.rank + "icecandidate"
      });
      this.pc.onicecandidate = null;
    }.bind(this);
  },
  onopen: function tsp_onopen() {
    console.log("opened");
  },
  handleEvent: function tsp_ondata(evt) {
    var message = JSON.parse(evt.data);
    switch (evt.type) {
      case 'availablechange':
        this.rank = 'primary';
        this.log(message.length + ' screens available:' + message);
        // TODO: make screen selectable.
        this.sendOffer();
        break;
      case 'offer':
        console.log(message);
        this.rank = 'secondary';
        this.gotRemoteOffer(message.data);
        break;
      case 'answer':
        console.log(message);
        this.gotRemoteAnswer(message.data);
        break;
      case 'ping':
        this.log('Connected to signaling server:' + message.ping);
        break;
      case 'icecandidate':
        this.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        break;
    }
  },
  onclose: function tsp_onclose() {

  },
/////////////////////////////////////
  sendOffer: function tsp_sendOffer() {
    console.log(this.rank + ":sendoffer");
    // create Data channel and set receiver for it
    // (we call onDataChannel manually since it's only triggered on answer side)
    this.onDataChannel({channel: this.pc.createDataChannel("myc")});
    this.pc.createOffer(function(offer) {
      this.pc.setLocalDescription(offer);
      this.serializeSend({
        event: 'offer',
        data: offer,
        roomNum: roomNum
      });
    }.bind(this), error);
  },
  serializeSend: function tsp_serializeSend(message) {
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/' + message.event);

    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');


    xhr.send(JSON.stringify(message));
    //xhr.onload = this.log.bind();
  },
  gotRemoteOffer: function tsp_gotRemoteOffer(offer) {
    console.log(this.rank + ":gotremoteoffer");
    this.pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
      this.pc.createAnswer(function(answer) {
        this.pc.setLocalDescription(answer);
        this.serializeSend({
          event: 'answer',
          data: answer,
          roomNum: roomNum
        });
      }.bind(this), error);
    }.bind(this), error);
    this.pc.ondatachannel = this.onDataChannel.bind(this);
  },
  gotRemoteAnswer: function tsp_gotRemoteAnswer(answer) {
    console.log("gotRemoteAnswer");
    if (this.rank == 'host') {
      return;
    }
    this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("gotRemoteAnswer");
  },

  //////
  onDataChannel: function tsp_onDataChannel(evt) {
    this.dc = evt.channel;
    this.dc.onmessage = function(evt) {
      console.log("bbbb");
      this.onDataChannelReceive && this.onDataChannelReceive(JSON.parse(evt.data));
    }.bind(this);
    console.log("dddd");
    this.dc.onopen = this.onDataChannelOpened.bind(this);
    this.dc.onerror = error;
    console.log("dddd");
  },
  onDataChannelOpened: function p_onDataChannelOpened(ev) {
    console.log("Open");
//    this.dc.send("Hello this is " + this.rank + " speaking");
  },
  dataChannelSend: function tsp_send(type, data, id) {
    this.dc.onerror = function(e) {
      console.log("ERROR:" + e);
    };
    this.dc.send(JSON.stringify({
      event: type,
      data: data,
      id: id
    }));
  },
  log: function tsp_log(message) {
    var div = document.createElement('div');
    div.textContent = message;
    document.body.appendChild(div);
  }
}
