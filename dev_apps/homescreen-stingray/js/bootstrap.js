/* global Homescreen */
'use strict';

window.addEventListener('load', function() {
  new Homescreen().init();
  window.widgetFactory = new WidgetFactory();
  window.widgetManager = new WidgetManager().start();


  var origin = document.location.protocol + '//' +
    'clock.gaiamobile.org' + (window.location.port ?
    (':' + window.location.port) : '');
  var entryPoint = origin + '/index.html';
  widgetFactory.createWidget({
    widgetOrigin: origin,
    w: 100,
    h: 100,
    x: 50,
    y: 50
  });
});
