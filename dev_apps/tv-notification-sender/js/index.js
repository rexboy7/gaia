/*global CallSender */

window.onload = function() {
  window.onload = null;
  Connection.init();
  CallSender.init(navigator.mozTelephony);
  SMSSender.init();
};
