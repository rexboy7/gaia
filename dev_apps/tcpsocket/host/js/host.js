/*var chattxt = document.getElementById('chattxt');
var sendbutton = document.getElementById('sendbutton');
var session = null;

// For host
Presentation.onavailablechange = function() {
  console.log("Hey!");
  session = this.requestSession('http://url.url.url');

  session.onstatechange = function() {
    Presentation.log("This is server presenting");
    Presentation.log("state:" + this.state);
  };
  session.onmessage = this.log.bind(this);

}; */