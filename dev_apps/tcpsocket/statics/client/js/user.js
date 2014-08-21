var chattxt = document.getElementById('chattxt');
var sendbutton = document.getElementById('sendbutton');
var session = null;

sendbutton.addEventListener('click', function() {
  session.postMessage(chattxt.value);
});

// For guest
Presentation.onavailablechange = function(e) {
  session = Presentation.requestSession('/statics/presenter/index.html');
  session.onmessage = this.log.bind(this);
};
var UI = {
  btnDisconnect: document.getElementById('btnDisconnect'),
  init: function ui_init() {
    this.btnDisconnect.onclick = this.disconnect.bind(this);
  },
  disconnect: function php_disconnect() {
    session.close();
  }
}
UI.init();