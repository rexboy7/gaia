'use strict';
var serverDN = 'rexboy.corp.tpe1.mozilla.com';
var serverPort = '8000';
var roomNum = 4096;
var rank = 'secondary_host';
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
