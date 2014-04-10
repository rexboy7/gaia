/* global BrowserConfigHelper, WidgetWindow, Applications */
'use strict';

(function(exports) {

  var WidgetFactory = function() {
  };

  WidgetFactory.prototype = {
    createWidget: function(args) {
      var manifestURL = args.widgetOrigin + '/manifest.webapp';
      var appInfo = Applications.getByManifestURL(manifestURL);
      if (!appInfo.manifest) {
        return;
      }

      var appURL = args.widgetOrigin + (args.widgetEntryPoint ?
        appInfo.manifest.entry_points[args.widgetEntryPoint].launch_path :
        appInfo.manifest.launch_path);

      var config = new BrowserConfigHelper(appURL, manifestURL);

      var widgetOverlay =
        document.getElementsByClassName('widget-overlay')[0];
      var app = new WidgetWindow(config, widgetOverlay);
      // XXX: Separate styles.
      app.setStyle(args);
      this.publish('launchwidget', app.instanceID);

      return app;
    },

    publish: function wf_publish(event, detail) {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, true, false, detail);
      window.dispatchEvent(evt);
    }
  };

  exports.WidgetFactory = WidgetFactory;
}(window));
