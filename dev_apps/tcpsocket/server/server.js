var express = require('express');
var http = require('http');
var sys = require('sys');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use('/statics', express.static(__dirname + '/../statics'));
app.use(bodyParser.json());

var nextRoom = 0;
var primary = {};
var secondary = {};


app.get('/primary/:roomNum', function(req, res) {
  res.locals.roomNum = req.params.roomNum;
  res.render("primary");
});

app.get('/secondary/:roomNum', function(req, res) {
  res.locals.roomNum = req.params.roomNum;
  res.render("secondary");
});

app.get('/events/primary/:roomNum', function(req, res) {
  var roomNum = req.params.roomNum;
  console.log(req.params.myname);
  sendSSEHeader(res);
  console.log(roomNum);
  console.log(!!primary[roomNum]);
  if (!!primary[roomNum]) {
    primary[roomNum].push(res);
  } else {
    primary[roomNum] = [res];
  }
  if (secondary[roomNum]) {
    notifyAvailablechange(roomNum);
  }
  res.on('close', removeFromRoom.bind(null, primary, roomNum, res));
});


app.get('/events/secondary/:roomNum', function(req, res) {
  var roomNum = req.params.roomNum;
  sendSSEHeader(res);
  if (!!secondary[roomNum]) {
    secondary[roomNum].push(res);
  } else {
    secondary[roomNum] = [res];
  }
  console.log("???" + secondary[roomNum].length);
  console.log("???" + primary[roomNum].length);
  notifyAvailablechange(roomNum);
  res.on('close', removeFromRoom.bind(null, secondary, roomNum, res));
});

app.post('/offer', function(req, res) {
  secondaryBroadcast(req.body.roomNum, 'offer', req.body);
  res.end();
});

app.post('/answer', function(req, res) {
  primaryBroadcast(req.body.roomNum, 'answer', req.body);
  res.end();
});

app.post('/primaryicecandidate', function(req, res) {
  secondaryBroadcast(req.body.roomNum, 'icecandidate', req.body);
  res.end();
});

app.post('/secondaryicecandidate', function(req, res) {
  primaryBroadcast(req.body.roomNum, 'icecandidate', req.body);
  res.end();
});

function removeFromRoom(pool, roomNum, req) {
  console.log("HEHEHE Removed ^_^" + roomNum);
  pool[roomNum].splice(pool[roomNum.indexOf(req)], 1);
};

function notifyAvailablechange(roomNum) {
  // TODO: use true IDs
  var secondaryId = [];
  for(var i = 0; i < secondary[roomNum].length; i++) {
    secondaryId.push(i);
  }
  primaryBroadcast(roomNum, 'availablechange', { screens: secondaryId });
}

function primaryBroadcast(roomNum, event, data) {
  primary[roomNum].forEach(function(res) {
    appendSSE(res, event, data);
  });
}

function secondaryBroadcast(roomNum, event, data) {
  secondary[roomNum].forEach(function(res) {
    appendSSE(res, event, data);
  });
}

app.listen(8000);

function sendSSEHeader(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  appendSSE(res, 'ping', {ping: "hello"});

}

function appendSSE(res, event, data) {
  //console.log(res);
  if (typeof data == 'object') {
    data = JSON.stringify(data);
  }
  console.log("event: " + event);
  console.log("data: " + data + '\n');
  console.log(res.write("event: " + event + '\n'));
  console.log(res.write("data: " + data + '\n\n'));
}

function debugHeaders(req) {
  sys.puts('URL: ' + req.url);
  for (var key in req.headers) {
    sys.puts(key + ': ' + req.headers[key]);
  }
  sys.puts('\n\n');
}