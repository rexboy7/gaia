'use strict';

//var _globals = window.location.href.split('/');
var serverDN = 'rexboy.corp.tpe1.mozilla.com';//_globals[2].split(':')[0];
var serverPort = 8000;//_globals[2].split(':')[1];
var roomNum = 9527;//_globals.pop();
var rank = 'primary';//_globals.pop();
var serverUrl = 'http://' + [serverDN, serverPort].join(':');
var eventUrl = serverUrl + '/events/' + rank + "/" + roomNum;

var pc_config = webrtcDetectedBrowser === 'firefox' ?
  {'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
  {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = webrtcDetectedBrowser === 'firefox' ? {
  'optional': [
    {'DtlsSrtpKeyAgreement': true},
    {'RtpDataChannels': true}
  ]} : {
  'optional': [
    {'DtlsSrtpKeyAgreement': true},
    {'RtpDataChannels': true}
  ]}


function error(e) {
  console.log(JSON.stringify(e));
  throw e;
}
