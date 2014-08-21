var server = navigator.mozTCPSocket.listen('8105');
window.addEventListener("beforeunload", function (e) {
  server.close();
});
//var socket = navigator.mozTCPSocket.open('127.0.0.1', 8192);

var connections = [];
// =================
function serializeSend(connection, message) {
  console.log(message);
  connection.send(JSON.stringify(message));
}
server.onconnect = function (evt) {
  var connection = evt;
  connections.push(evt);
  if (connections.length == 1) {
    serializeSend(connection, {event: 'created'});
  } else {
    serializeSend(connection, {event: 'joined'});
    connections.forEach(function(member) {
      if(member != connection) {
        serializeSend(member, {event: 'memberadded'});
      }
    })
  }

  connection.ondata = function(evt) {
    connections.forEach(function(members) {
      if (members != evt) {
        // Broadcasting data to other sockets.
        members.send(evt.data);
      }
    });
  };
  connection.onerror = function(e) {
    console.log(e);
    throw e;
  }
  connections.onclose = function(evt) {
    connections.splice(connections.indexOf(evt));
    connections.forEach(function(members) {
      members.send({
        event: 'memberleft',
        data: connections.length
      });
    })
  };
};

