/* global BrowserConfigHelper, WidgetWindow, Applications */
'use strict';

(function(exports) {

  var WidgetFactory = function() {
  };

  WidgetFactory.prototype = {
    /**
     * Add a widget window and put it into management.
     * @param {object} args Arguments for creating widget. Including:
     * widgetOrigin:     origin URI for widget
     * widgetEntryPoint: (optional) entry point name that need to be used. The
     *                   name specified must consist with the manifest file.
     * x:                left position of widget
     * y:                top position of widget
     * w:                width of widget
     * h:                height of widget
     */
    createWidget: function(args) {
      var manifestURL = args.widgetOrigin + '/manifest.webapp';
      var appInfo = applications.getByManifestURL(manifestURL);
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

