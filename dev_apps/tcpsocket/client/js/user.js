var chattxt = document.getElementById('chattxt');
var sendbutton = document.getElementById('sendbutton');
var session = null;

sendbutton.addEventListener('click', function() {
  session.postMessage(chattxt.value);
})

// For host
Presentation.onavailablechange = function() {
  console.log("Hey!");
  session = this.requestSession('http://url.url.url');

  session.onstatechange = function() {
    Presentation.log("This is server presenting");
    Presentation.log("state:" + this.state);
  };
  session.onmessage = this.log.bind(this);

};

// For guest
Presentation.onpresent = function(e) {
  Presentation.log("This is client presenting");
  Presentation.log("state:" + e.session.state);
  session = e.session;
  session.onmessage = this.log.bind(this);
};

